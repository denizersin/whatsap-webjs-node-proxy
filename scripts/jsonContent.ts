import path from 'path';
import { logWithDate } from '../utils/logger.js';
import Whatsapp from 'whatsapp-web.js';
const { MessageMedia } = Whatsapp;
interface AttachmentFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export async function jsonContent(
  client: any,
  caption: string,
  attachmentFiles: AttachmentFile[],
  id: string
): Promise<void> {
  
  for (const attachmentFile of attachmentFiles) {
    const ext = path.extname(attachmentFile.originalname).toLowerCase();

    let mimetype = attachmentFile.mimetype;
    if (mimetype === 'application/octet-stream') {
      if (ext === '.jpg' || ext === '.jpeg') {
        mimetype = 'image/jpeg';
      } else if (ext === '.png') {
        mimetype = 'image/png';
      }
    }

    const media = new MessageMedia(
      mimetype,
      attachmentFile.buffer.toString('base64'),
      attachmentFile.originalname,
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