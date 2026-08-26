import "dotenv/config";

const BASE_URL = (process.env["OMNIROUTE_BASE_URL"] ?? "http://127.0.0.1:20138")
  .replace(/\/$/, "");
const API_KEY = process.env["OMNIROUTE_API_KEY"];
const MODEL = process.env["OMNIROUTE_MODEL"] ?? "free-stack";

async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
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
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      console.error(`OmniRoute error ${res.status}: ${await res.text()}`);
      return null;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      for (const line of buffer.split("\n")) {
        if (line.startsWith("data:")) {
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") {
            buffer = "";
            break;
          }
          try {
            const json = JSON.parse(payload) as {
              choices?: { delta?: { content?: string } }[];
            };
            content += json.choices?.[0]?.delta?.content ?? "";
          } catch {
            // ignore keep-alive / partial lines
          }
        }
      }

      buffer = buffer.split("\n").pop() ?? "";
    }

    return content.trim() || null;
  } catch (error) {
    console.error("OmniRoute query error:", error);
    return null;
  }
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

export async function generateSecretTermFromCategory(category: string) {
  const response = await chatCompletion(
    "You are generating terms for a guessing game. " +
      "Respond with a JSON array of 5 random terms from the given category. " +
      "Ensure terms actually exist for real-world categories.",
    `Category: ${category}`,
  );

  if (!response) return null;

  // Select random term
  const terms = parseJSONArray(response);
  if (terms.length === 0) return null;

  return terms[Math.floor(Math.random() * terms.length)];
}

export async function askQuestion(
  secretTerm: string,
  category: string,
  question: string,
) {
  const response = await chatCompletion(
    `Secret Term: ${secretTerm}\n` +
      `Category: ${category}\n` +
      "Context: You're playing a guessing game. Answer questions about the secret term without:\n" +
      "- Revealing the term or parts of it\n" +
      "- Giving too many hints\n" +
      "- Confirming guesses unless exactly correct\n\n" +
      "Instructions:\n" +
      "1. Be vague but truthful\n" +
      "2. Never mention letters or word structure\n" +
      "3. Only confirm exact matches",
    `Question: ${question}`,
  );

  return response;
}