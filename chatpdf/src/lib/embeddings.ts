import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key from environment variables
});

/**
 * Function to generate embeddings for a given text using OpenAI's Embedding API.
 * @param text - The input text to convert into an embedding vector.
 * @returns A promise resolving to an array of numbers representing the embedding.
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    // Make a request to OpenAI's embedding model with the given text
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002', // Specifies the embedding model to use
      input: text.replace(/\n/g, ' '), // Replace newline characters with spaces for better processing
    });

    // Return the first embedding from the response as an array of numbers
    return response.data[0].embedding;
  } catch (error) {
    // Log the error and rethrow it for handling by the caller
    console.error('Error calling OpenAI Embeddings API:', error);
    throw error;
  }
}