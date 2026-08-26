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

async function chatCompletion(
  messages: ChatMessage[],
  tools?: typeof WEB_SEARCH_TOOL[],
): Promise<{ content: string | null; toolCalls: ToolCall[] } | null> {
  if (!API_KEY) {
    console.error("OMNIROUTE_API_KEY is not set");
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages,
        ...(tools ? { tools } : {}),
      }),
    });

    if (!res.ok) {
      console.error(`OmniRoute error ${res.status}: ${await res.text()}`);
      return null;
    }

    const json = await res.json() as {
      choices?: { message?: { content?: string | null; tool_calls?: {
        id?: string;
        function?: { name?: string; arguments?: string };
      }[] } }[];
    };

    const message = json.choices?.[0]?.message;
    if (!message) return null;

    const toolCalls: ToolCall[] = (message.tool_calls ?? [])
      .filter((tc) => tc.id && tc.function?.name)
      .map((tc) => ({
        id: tc.id as string,
        name: tc.function!.name!,
        arguments: parseJSONObject(tc.function?.arguments ?? null),
      }));

    return { content: message.content ?? null, toolCalls };
  } catch (error) {
    console.error("OmniRoute query error:", error);
    return null;
  }
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

async function runToolLoop(
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const messages: ChatMessage[] = [
    { role: "system", content: `${systemPrompt}\n\n${FACT_CHECK_SYSTEM}` },
    { role: "user", content: userPrompt },
  ];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await chatCompletion(messages, [WEB_SEARCH_TOOL]);
    if (!response) return null;

    // Process tool calls first, even if the model also emitted content.
    if (response.toolCalls.length === 0) {
      return response.content;
    }

    messages.push({
      role: "assistant",
      content: response.content,
      tool_calls: response.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
      })),
    });

    for (const tc of response.toolCalls) {
      if (tc.name === "web_search") {
        const query = typeof tc.arguments["query"] === "string"
          ? tc.arguments["query"]
          : "";
        console.log("AI web_search:", query);
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
  const response = await runToolLoop(
    "You are generating terms for a guessing game. " +
      "Respond with ONLY a JSON array of 5 random terms from the given category. " +
      "Ensure every term actually exists in the real world for the given category. " +
      "If you are not confident that real terms exist in this category, use web_search once to find them, " +
      "then respond with the JSON array. Do not search more than once.",
    `Category: ${category}`,
  );

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
  const answer = await runToolLoop(
    buildQuestionSystemPrompt(secretTerm, category),
    `Question: ${question}`,
  );

  if (!answer) return;

  // Chunk the answer so the client still renders it incrementally
  for (const chunk of answer.match(/[\s\S]{1,40}/g) ?? []) {
    yield chunk;
  }
}

export async function askQuestion(
  secretTerm: string,
  category: string,
  question: string,
) {
  return runToolLoop(
    buildQuestionSystemPrompt(secretTerm, category),
    `Question: ${question}`,
  );
}