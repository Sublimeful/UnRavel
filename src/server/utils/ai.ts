import "dotenv/config";

const BASE_URL = (process.env["OMNIROUTE_BASE_URL"] ?? "http://127.0.0.1:20138")
  .replace(/\/$/, "");
const API_KEY = process.env["OMNIROUTE_API_KEY"];
const MODEL = process.env["OMNIROUTE_MODEL"] ?? "free-stack";
const SEARXNG_URL = (process.env["SEARXNG_URL"] ?? "http://localhost:8080")
  .replace(/\/$/, "");

const MAX_TOOL_ITERATIONS = 3;

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: unknown[] }
  | { role: "tool"; tool_call_id: string; content: string };

const WEB_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web to verify facts. Use when a fact may be time-sensitive, " +
      "may have changed since your training data, or you are not fully certain. " +
      "Do not use for stable common knowledge.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
};

const FACT_CHECK_SYSTEM =
  `Today's date is ${new Date().toISOString().slice(0, 10)}. ` +
  "Your training data may be outdated (earlier than 2025). " +
  "Use the web_search tool whenever a fact could have changed since your training, " +
  "is time-sensitive, or you are not fully certain. " +
  "Do NOT search for stable common knowledge such as basic vocabulary, colors, " +
  "well-known animals, or fixed definitions. " +
  "If you perform a search, base your answer only on the search results and never contradict them.";

interface ToolCallDelta {
  index: number;
  id?: string;
  function?: { name?: string; arguments?: string };
}

async function* streamChatCompletion(
  messages: ChatMessage[],
  tools?: typeof WEB_SEARCH_TOOL[],
): AsyncGenerator<string, { content: string; toolCalls: ToolCall[] } | null, unknown> {
  if (!API_KEY) {
    console.error("OMNIROUTE_API_KEY is not set");
    return null;
  }

  const toolAccum = new Map<number, { id: string; name: string; args: string }>();
  let content = "";

  try {
    const res = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages,
        ...(tools ? { tools } : {}),
      }),
    });

    if (!res.ok) {
      console.error(`OmniRoute error ${res.status}: ${await res.text()}`);
      return null;
    }

    const reader = res.body?.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let json: {
          choices?: { delta?: { content?: string; tool_calls?: ToolCallDelta[] } }[];
        };
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }

        const delta = json.choices?.[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          content += delta.content;
          yield delta.content;
        }

        for (const tc of delta.tool_calls ?? []) {
          const acc = toolAccum.get(tc.index) ?? { id: "", name: "", args: "" };
          if (tc.id) acc.id = tc.id;
          if (tc.function?.name) acc.name = tc.function.name;
          if (tc.function?.arguments) acc.args += tc.function.arguments;
          toolAccum.set(tc.index, acc);
        }
      }
    }
  } catch (error) {
    console.error("OmniRoute query error:", error);
    return null;
  }

  const toolCalls: ToolCall[] = [...toolAccum.values()]
    .filter((tc) => tc.id && tc.name)
    .map((tc) => ({
      id: tc.id,
      name: tc.name,
      arguments: parseJSONObject(tc.args),
    }));

  return { content, toolCalls };
}

function parseJSONObject(text: string | null): Record<string, unknown> {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fall through
  }
  return {};
}

function parseJSONArray(text: string): string[] {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
  try {
    const parsed = JSON.parse(match[1] ?? "[]");
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
  } catch {
    // fall through
  }
  return [];
}

async function webSearch(query: string): Promise<string> {
  try {
    const url = new URL(`${SEARXNG_URL}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (UnRavel game server)" },
    });

    if (!res.ok) {
      console.error(`SearXNG error ${res.status}: ${await res.text()}`);
      return "";
    }

    const json = await res.json() as {
      results?: { title?: string; url?: string; content?: string; snippet?: string }[];
    };

    const results = (json.results ?? []).slice(0, 6);
    if (results.length === 0) return "";

    return results
      .map((r, i) =>
        `${i + 1}. ${r.title ?? ""} - ${r.url ?? ""}\n${r.content ?? r.snippet ?? ""}`
      )
      .join("\n\n");
  } catch (error) {
    console.error("SearXNG query error:", error);
    return "";
  }
}

async function* runToolLoop(
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string, string | null, unknown> {
  const messages: ChatMessage[] = [
    { role: "system", content: `${systemPrompt}\n\n${FACT_CHECK_SYSTEM}` },
    { role: "user", content: userPrompt },
  ];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const full = yield* streamChatCompletion(messages, [WEB_SEARCH_TOOL]);
    if (!full) return null;

    // Process tool calls first, even if the model also emitted content.
    if (full.toolCalls.length === 0) {
      return full.content;
    }

    messages.push({
      role: "assistant",
      content: full.content,
      tool_calls: full.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
      })),
    });

    for (const tc of full.toolCalls) {
      // Normalize tool names: OpenAI-style web_search, antigravity/gemini's
      // native google_search:search, and any *search variant.
      const isSearch = tc.name === "web_search" ||
        tc.name === "google_search:search" ||
        tc.name.includes("search");

      if (isSearch) {
        // Gemini passes queries as an array or as a `q` shorthand;
        // OpenAI passes a single string under `query`.
        let query = "";
        if (typeof tc.arguments["query"] === "string") {
          query = tc.arguments["query"];
        } else if (Array.isArray(tc.arguments["queries"])) {
          query = tc.arguments["queries"]
            .filter((q): q is string => typeof q === "string")
            .join(" ");
        } else if (typeof tc.arguments["q"] === "string") {
          query = tc.arguments["q"];
        }
        console.log("AI search:", tc.name, query);
        const results = query ? await webSearch(query) : "";
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: results || "No search results found.",
        });
      } else {
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: "Unknown tool.",
        });
      }
    }
  }

  return null;
}

export async function generateSecretTermFromCategory(category: string) {
  const gen = runToolLoop(
    "You are generating terms for a guessing game. " +
      "Respond with ONLY a JSON array of 5 random terms from the given category. " +
      "Ensure every term actually exists in the real world for the given category. " +
      "If you are not confident that real terms exist in this category, use web_search once to find them, " +
      "then respond with the JSON array. Do not search more than once.",
    `Category: ${category}`,
  );

  let response: string | null = null;
  for (;;) {
    const { done, value } = await gen.next();
    if (done) {
      response = value;
      break;
    }
  }

  if (!response) return null;

  // Select random term
  const terms = parseJSONArray(response);
  if (terms.length === 0) return null;

  return terms[Math.floor(Math.random() * terms.length)];
}

function buildQuestionSystemPrompt(secretTerm: string, category: string): string {
  return (
    `Secret Term: ${secretTerm}\n` +
    `Category: ${category}\n` +
    "Context: You're playing a guessing game. Answer questions about the secret term without:\n" +
    "- Revealing the term or parts of it\n" +
    "- Giving too many hints\n" +
    "- Confirming guesses unless exactly correct\n\n" +
    "Instructions:\n" +
    "1. Be vague but truthful\n" +
    "2. Never mention letters or word structure\n" +
    "3. Only confirm exact matches"
  );
}

export async function* streamAskQuestion(
  secretTerm: string,
  category: string,
  question: string,
): AsyncGenerator<string, void, unknown> {
  const answer = yield* runToolLoop(
    buildQuestionSystemPrompt(secretTerm, category),
    `Question: ${question}`,
  );

  if (!answer) return;
}

export async function askQuestion(
  secretTerm: string,
  category: string,
  question: string,
): Promise<string | null> {
  const gen = runToolLoop(
    buildQuestionSystemPrompt(secretTerm, category),
    `Question: ${question}`,
  );

  for (;;) {
    const { done, value } = await gen.next();
    if (done) return value;
  }
}