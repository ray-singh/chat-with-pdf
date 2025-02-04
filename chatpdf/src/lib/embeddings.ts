import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

/**
 * Function to generate embeddings for a given text using OpenAI's Embedding API.
 * @param text - The input text to convert into an embedding vector.
 * @returns A promise resolving to an array of numbers representing the embedding.
 */
export async function getEmbeddings(text: string): Promise<number[]> {
    try {
      // Make a request to OpenAI's embedding model with the given text
      const response = await openai.createEmbedding({
        model: "text-embedding-ada-002", // Specifies the embedding model to use
        input: text.replace(/\n/g, " "), // Replace newline characters with spaces for better processing
      });
  
      // Parse the JSON response
      const result = await response.json();
  
      // Return the first embedding from the response as an array of numbers
      return result.data[0].embedding as number[];
    } catch (error) {
      // Log the error and rethrow it for handling by the caller
      console.log("Error calling OpenAI Embeddings API", error);
      throw error;
    }
  }