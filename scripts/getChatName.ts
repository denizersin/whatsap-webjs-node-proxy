import { Client } from 'whatsapp-web.js';

export async function getChatName(client: Client, id: string): Promise<string> {
  const chat = await client.getChatById(id);
  return chat.name;
} 