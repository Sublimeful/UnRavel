import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

// Initialize Gemini Flash model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

export async function generateSecretTermFromCategory(category: string) {
  try {
    // Define output schema
    const ResponseFormatter = z.object({
      terms: z
        .array(z.string())
        .nonempty()
        .describe("List of random terms from the category"),
    });

    // Create structured chain
    const chain = model.withStructuredOutput(ResponseFormatter);

    // Generate terms
    const response = await chain.invoke([
      new SystemMessage(
        "Generate a JSON-formatted list of random terms from the category. " +
          "Ensure terms actually exist for real-world categories.",
      ),
      new HumanMessage(`Category: ${category}`),
    ]);

    // Select random term
    return response.terms[Math.floor(Math.random() * response.terms.length)];
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
}

export async function askQuestion(
  secretTerm: string,
  category: string,
  question: string,
) {
  try {
    // Generate response using structured messages
    const response = await model.invoke([
      new SystemMessage(
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
      ),
      new HumanMessage(`Question: ${question}`),
    ]);

    return response.content.toString().trim();
  } catch (error) {
    console.error("Gemini query error:", error);
    return null;
  }
}
