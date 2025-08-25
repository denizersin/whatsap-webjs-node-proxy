import { Client } from 'whatsapp-web.js';
import { logWithDate } from '../utils/logger.js';

export async function txtContent(client: Client, message: string, id: string): Promise<void> {
  try {
    const chat = await client.getChatById(id);
    const groupName = chat.name;
    const sentMessage = await client.sendMessage(id, message);
    logWithDate(
      `Report successfully sent to ${groupName} with message ID: ${sentMessage.id._serialized}`,
    );
  } catch (error) {
    logWithDate(`Error sending message: ${error}`);
  }
} 