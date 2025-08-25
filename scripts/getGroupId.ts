import { Client } from 'whatsapp-web.js';
import { logWithDate } from '../utils/logger.js';

interface GroupInfo {
  id: string;
  name: string;
}

export async function getGroupID(client: Client, groupName: string): Promise<string | null> {
  const chats = await client.getChats();
  const targetGroup = chats
    .filter((chat) => chat.isGroup && chat.name === groupName)
    .map((chat) => {
      return {
        id: chat.id._serialized,
        name: chat.name,
      };
    })[0];

  if (targetGroup) {
    logWithDate(`Group ID ${groupName}: ${targetGroup.id}`);
    return targetGroup.id;
  } else {
    logWithDate(`Group ID ${groupName} not found`);
    return null;
  }
} 