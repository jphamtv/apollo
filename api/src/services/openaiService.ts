import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to get the file path from a URL
function getLocalPathFromUrl(imageUrl: string): string | null {
  if (!imageUrl) return null;

  const urlParts = imageUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const fileType = urlParts[urlParts.length - 2].replace('s', '');

  return path.join(__dirname, `../../uploads/${fileType}s/${filename}`);
}

// Function to read image as base64
async function getImageAsBase64(filePath: string): Promise<string | null> {
  try {
    if (!fs.existsSync(filePath)) return null;

    const fileBuffer = await fs.promises.readFile(filePath);
    return fileBuffer.toString('base64');
  } catch (err) {
    console.error('Error reading image file: ', err);
    return null;
  }
}

export async function generateBotResponse(
  systemPrompt: string,
  quotes: string[],
  conversationHistory: Array<{ role: string, content: string, imageUrl?: string }>,
  maxTokens: number = 150
): Promise<string> {
  try {
    // Select up to 10 random quotes if available
    const selectedQuotes = quotes && quotes.length > 0
      ? quotes.sort(() => 0.5 - Math.random()).slice(0, 10)
      : [];
    
    // Enhance system prompt with quotes
    const enhancedPrompt = selectedQuotes.length > 0
      ? `${systemPrompt}\n\nOccasionally incorporate these quotes (make sure to remove the quotations) when appropriate:\n${selectedQuotes.join('\n')}`
      : systemPrompt;
    
    // Format messages, handling images when present
    const messages = [];

    // Add system prompt
    messages.push({
      role: "developer",
      content: enhancedPrompt
    });
    
    // Process conversation history with possible images
    for (const message of conversationHistory) {
      const formattedMessage: any = {
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.imageUrl ? [] : message.content
      };

      // If there's an image URL, try to include it
      if (message.imageUrl) {
        const filePath = getLocalPathFromUrl(message.imageUrl);
        if (filePath) {
          const base64Image = await getImageAsBase64(filePath);
          if (base64Image) {
            const contentArray = [];

            // Add text content if present
            if (message.content) {
              contentArray.push({
                type: "text",
                text: message.content
              });
            }

            // Add image content
            contentArray.push({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            });

            formattedMessage.content = contentArray;
          } else {
            // Fallback to text-only if image can't be processed
            formattedMessage.content = message.content;
          }
        } else {
          // Fallback to text-ony if image path can't be determined
          formattedMessage.content = message.content;
        }
      }

      messages.push(formattedMessage);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.75,
    });

    return response.choices[0].message.content || "I'm having trouble connecting right now.";
  } catch (err) {
    console.error('Error generating bot response: ', err);
    return "I'm unable to respond right now. Please try again later."
  }
}