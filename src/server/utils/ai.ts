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

export async function generateSecretTermFromCategory(category: string) {
  function tryParse(text: string) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  const res = await promptAI({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          `Only provide a JSON formatted list of strings, with each string being a random term from the category. If the category is related to the real world, make sure the term actually exists.`,
      },
      {
        role: "user",
        content:
          `Generate a list of random terms from this category: ${category}`,
      },
    ],
    prediction: {
      type: "content",
      content: "```json\n[...]\n```",
    },
  });

  if (!res) return null;

  // Try to parse this "JSON" and return a random term from it. The keyword here is "TRY".
  try {
    // It always seems to format it starting with ```json on the first line and ending with ``` on the last line
    const terms = tryParse(res) as string[] ||
      tryParse(
        res.split("\n").slice(1, res.split("\n").length - 1).join("\n"),
      ) as string[];

    return terms[Math.floor(Math.random() * terms.length)];
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function askQuestion(
  secretTerm: string,
  category: string,
  question: string,
) {
  return await promptAI(
    {
      model: "gpt-4o",
      temperature: 0.2,
      messages: [{
        role: "system",
        content: `Secret Term: ${secretTerm}
Category: ${category}
Context: The user is playing a game where they ask you questions to find out what the secret term is. Any question that is asked will be in an attempt to gather more information about the secret term.
Instructions: Do not give away too much information or too many hints in your answer. Do not give away parts of the secret term, such as letters or words. Do not under any circumstances say or give away the secret term unless the user guesses it.`,
      }, {
        role: "user",
        content: `Question: ${question}`,
      }],
    },
  );
}
