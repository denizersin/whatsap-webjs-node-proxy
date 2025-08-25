import { logWithDate } from '../utils/logger.js';
import Whatsapp from 'whatsapp-web.js';
const { MessageMedia } = Whatsapp;

interface Base64Image {
  mimetype: string;
  data: string;
  filename: string;
}

export async function base64ImageContent(
  client: any,
  caption: string,
  base64Images: Base64Image[],
  id: string
): Promise<void> {
  
  for (const base64Image of base64Images) {
    const media = new MessageMedia(
      base64Image.mimetype,
      base64Image.data,
      base64Image.filename,
    );

    try {
      const chat = await client.getChatById(id);
      const groupName = chat.name;
      const sentMessage = await client.sendMessage(id, media, {
        caption: caption,
      });
      logWithDate(
        `Report successfully sent to ${groupName} with message ID: ${sentMessage.id._serialized}`,
      );
    } catch (error) {
      logWithDate(`Error sending message: ${error}`);
    }
  }
} 