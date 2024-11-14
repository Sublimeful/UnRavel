import "dotenv/config";

const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];

async function promptAI(requestBody: Record<string, any>) {
  console.log("Prompting AI...");

  const res = await fetch(
    `https://api.openai.com/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (res.status === 200) {
    const json = await res.json() as {
      choices: { message: { role: string; content: string } }[];
    };

    console.log(json);

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
  const res = await promptAI({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          `Only provide a JSON formatted list of strings, with each string being a random word or phrase from the category. If the category is related to the real world, make sure the words/phrases actually exist.`,
      },
      {
        role: "user",
        content:
          `Generate a list of random words or phrases from this category: ${category}`,
      },
    ],
  });

  if (!res) return null;

  // Try to parse this "JSON" and return a random word or phrase from it. The keyword here is "TRY".
  try {
    // It always seems to format it starting with ```json on the first line and ending with ``` on the last line
    const phrases = JSON.parse(
      res.split("\n").slice(1, res.split("\n").length - 1).join("\n"),
    ) as string[];

    return phrases[Math.floor(Math.random() * phrases.length)];
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function askClosedEndedQuestion(
  secretPhrase: string,
  category: string,
  question: string,
) {
  return await promptAI(
    {
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{
        role: "system",
        content:
          `Your secret phrase is "${secretPhrase}" from the category "${category}". The user is playing a game where they ask you closed ended questions to find out what the secret phrase is. Do not give away the secret phrase unless the user guesses it.`,
      }, {
        role: "user",
        content: `In regards to the secret phrase: ${question}`,
      }],
    },
  );
}
