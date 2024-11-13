import "dotenv/config";

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];

async function promptGemini(prompt: string, systemPrompt: string = "") {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "system_instruction": systemPrompt
          ? { "parts": { "text": systemPrompt } }
          : undefined,
        "contents": {
          "parts": {
            "text": prompt,
          },
        },
      }),
    },
  );

  if (res.status === 200) {
    const json = await res.json();
    console.log("Prompt:", prompt, systemPrompt, JSON.stringify(json));
    const { candidates } = json;
    const firstCandidate = candidates[0];
    const { content } = firstCandidate;

    // This means that the ai did not respond because of safety reasons or something else
    // TODO: Maybe handle this case in the future?
    if (!content) return null;

    const { parts } = content;
    const firstPart = parts[0];
    const { text } = firstPart;

    return (text as string).trim();
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function generateSecretPhraseFromCategory(category: string) {
  return await promptGemini(
    `Give me a random word/phrase from the category: ${category}`,
    "Just say the word/phrase, no extra fluff",
  );
}

export async function askClosedEndedQuestion(
  secretPhrase: string,
  category: string,
  question: string,
) {
  return await promptGemini(
    question,
    `
      When asked a question by the user, please follow the logic below:

      const secret_phrase = ${secretPhrase};

      if (isOpenEnded(user_question) {
        return {"Not a valid question", reason};
      } else if (user_question.contains(secret_phrase)) {
        return "Yes.";
      } else {
        return shortResponse();
      }
    `,
  );
}
