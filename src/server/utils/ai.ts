import "dotenv/config";

const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];

async function promptAI(
  prompt: string,
  instructions: string,
) {
  const res = await fetch(
    `https://api.openai.com/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        "model": "gpt-4o-mini",
        "messages": [{ "role": "system", "content": instructions }, {
          "role": "user",
          "content": prompt,
        }],
      }),
    },
  );

  if (res.status === 200) {
    const json = await res.json() as {
      choices: { message: { role: string; content: string } }[];
    };

    const { choices } = json;

    // This means that the ai did not respond because of safety reasons or something else
    // TODO: Maybe handle this case in the future?
    if (choices.length === 0) return null;

    const firstChoice = choices[0];

    const { message } = firstChoice;

    return (message.content as string).trim();
  } else {
    console.error(await res.text());

    return null;
  }
}

export async function generateSecretPhraseFromCategory(category: string) {
  return await promptAI(
    `Give me a random word/phrase from the category: ${category}`,
    "Just say the word/phrase, no extra fluff",
  );
}

export async function askClosedEndedQuestion(
  secretPhrase: string,
  category: string,
  question: string,
) {
  return await promptAI(
    question,
    `
      Your secret phrase is "${secretPhrase}" from the category "${category}". The user is playing a game where they ask you closed ended questions to find out what the secret phrase is, follow these sets of rules when responding to the user:
        1. Do not give away the secret phrase unless the user guesses it
        2. If the user asks an open ended question, warn the user and tell them to ask a closed ended question instead
        3. If the user asks an unrelated question, warn the user
    `,
  );
}
