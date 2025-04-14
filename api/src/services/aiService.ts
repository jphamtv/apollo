import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

type ContentItem = {
  type: string;
  text?: string;
  image_url?: {
    url: string,
    detail: string
  }
};

interface MessageContent {
  role: string;
  content: string | ContentItem[];
}

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4.1-mini',
  maxTokens: 150, // Max output for each response
  temperature: 0.8,
});

/**
 * Generates an AI response using LangChain and OpenAI
 * @param systemPrompt - The bot's persona/character description
 * @param quotes - Array of quotes that can be incorporated into responses
 * @param conversationHistory - Previous messages in the conversation, may include image URLs
 * @returns The generated response text
 */
export async function generateBotResponse(
  systemPrompt: string,
  quotes: string[],
  conversationHistory: Array<MessageContent>,
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
      new SystemMessage(enhancedPrompt),
      ...conversationHistory.map(message => {
        if (message.role === 'assistant') {
          // For assistant messages, convert ContentItem[] to the expected format or use string directly
          if (typeof message.content === 'string') {
            return new AIMessage(message.content);
          } else {
            // Content is an array of ContentItems, wrap it in the content property
            return new AIMessage({ content: message.content });
          }
        } else {
          // Handle both string content and array content (for images)
          if (typeof message.content === 'string') {
            return new HumanMessage(message.content);
          } else {
            // For messages with images
            return new HumanMessage({ content: message.content });
          }
        }
      }),
    ];

    // Call the model
    const response = await model.invoke(messages);

    return response.content.toString();
  } catch (err) {
    logger.error(`Error generating bot response: ${err}`);
    return "I'm unable to respond right now. Please try again later.";
  }
}

/**
 * Formats a text and image URL into the proper structure for LangChain
 * @param text - The message text
 * @param imageUrl - Optional URL to an image
 * @param detail - Detail level for image processing
 * @returns Properly formatted content for LangChain
 */
export function formatMessageWithImage(
  text: string, 
  imageUrl?: string, 
  detail: string = 'low'
) {
  const content: ContentItem[] = [
    { type: 'text', text }
  ];
  
  if (imageUrl) {
    content.push({
      type: 'image_url',
      image_url: { 
        url: imageUrl,
        detail: detail
      }
    });
  }
  
  return content;
}
