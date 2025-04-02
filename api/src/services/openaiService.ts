// OpenAI service for generating AI chatbot responses
import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam, ChatCompletionContentPart } from 'openai/resources';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Type definition for message content that can include text or images
 */
interface MessageContent {
  role: string;
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
}

/**
 * Generates an AI response using OpenAI's GPT model
 * @param systemPrompt - The bot's persona/character description
 * @param quotes - Array of quotes that can be incorporated into responses
 * @param conversationHistory - Previous messages in the conversation, may include image URLs
 * @param maxTokens - Maximum response length
 * @returns The generated response text
 */
export async function generateBotResponse(
  systemPrompt: string,
  quotes: string[],
  conversationHistory: Array<MessageContent>,
  maxTokens: number = 150
): Promise<string> {
  try {
    // Select up to 15 random quotes if available
    const selectedQuotes =
      quotes && quotes.length > 0
        ? quotes.sort(() => 0.5 - Math.random()).slice(0, 15)
        : [];

    // Enhance system prompt with quotes
    const enhancedPrompt =
      selectedQuotes.length > 0
        ? `${systemPrompt}\n\nOccasionally incorporate these quotes (make sure to remove the quotations) when appropriate:\n${selectedQuotes.join('\n')}`
        : systemPrompt;

    // Format messages, supporting both text-only and image content
    const messages = [
      {
        role: 'developer',
        content: enhancedPrompt,
      },
      ...conversationHistory.map(message => {
        // Handle messages that might have image URLs
        return {
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
        };
      }),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as ChatCompletionAssistantMessageParam[],
      max_tokens: maxTokens,
      temperature: 0.75,
    });

    return (
      response.choices[0].message.content ||
      "I'm having trouble connecting right now."
    );
  } catch (err) {
    logger.error(`Error generating bot response: ${err}`);
    return "I'm unable to respond right now. Please try again later.";
  }
}
