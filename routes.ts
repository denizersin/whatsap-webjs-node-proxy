import { Express, Request, Response } from 'express';
import { Client } from 'whatsapp-web.js';
import multer from 'multer';
import { txtContent } from './scripts/txtContent.js';
import { jsonContent } from './scripts/jsonContent.js';
import { getChatName } from './scripts/getChatName.js';
import { getGroupID } from './scripts/getGroupId.js';
import { base64ImageContent } from './scripts/base64ImageContent.js';
import { verifyKey } from './utils/uth.js';
import { validator } from './utils/validator.js';
import { tryCatchSync } from './utils/index.js';

const upload = multer({ storage: multer.memoryStorage() });

interface AttachmentFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

interface Base64Image {
  mimetype: string;
  data: string;
  filename: string;
}

export default function (app: Express, client: Client): void {
  // Health check route
  app.get('/', function (_req: Request, res: Response) {
    res.send('Server is running!');
  });

  // Send plaintext message to the given id
  app.post('/send-plaintext', verifyKey, async (req: Request, res: Response): Promise<void> => {
    const { data, error } = tryCatchSync(() => validator.sendPlainText.parse(req.body));
    if (error) {
      res.status(400).send('Bad Request: ' + error.message);
      return;
    }
    const { message, id } = data;

    console.log('message-sent1', { data })

    try {
      await txtContent(client, message, id);
      const name = await getChatName(client, id);
      console.log('message-sent2',{data})
      res.send(`Message sent successfully to ${name}!`);
    } catch (error) {
      console.log('message-sent-error', { error })
      res.status(500).send(`Failed to send message: ${error}`);
    }
  });

  app.get('/check-connection', verifyKey, async (_req: Request, res: Response): Promise<void> => {
    const connection = await client?.getState();
    console.log(connection, 'connection');
    if (connection === 'CONNECTED') {
      res.send('Connected');
    } else {
      res.status(400).send('Not Connected');
    }
  });

  // Send file to the given id
  app.post(
    '/send-file',
    verifyKey,
    upload.array('attachment'),
    async (req: Request, res: Response): Promise<void> => {
      const { caption, id } = req.body;
      const attachmentFiles = req.files as AttachmentFile[];

      if (!attachmentFiles || attachmentFiles.length === 0 || !id) {
        res.status(400).send('Bad Request: Attachments and ID are required!');
        return;
      }

      try {
        await jsonContent(client, caption, attachmentFiles, id);
        const name = await getChatName(client, id);
        res.send(`Message sent successfully to ${name}!`);
      } catch (error) {
        res.status(500).send(`Failed to send message: ${error}`);
      }
    },
  );

  // Get group ID by group name
  app.post('/get-group-id', verifyKey, async (req: Request, res: Response): Promise<void> => {
    const { groupName } = req.body;
    if (!groupName) {
      res.status(400).send('Bad Request: Group Name is required!');
      return;
    }

    const groupId = await getGroupID(client, groupName);
    if (!groupId) {
      res.status(404).send('Group not found!');
      return;
    }

    res.send(groupId);
  });

  // Send base64 image to the given id
  app.post('/send-base64-image', verifyKey, async (req: Request, res: Response): Promise<void> => {
    const { caption, id, images: base64Images } = req.body as {
      caption: string;
      id: string;
      images: Base64Image[];
    };

    if (!base64Images || base64Images.length === 0 || !id) {
      res.status(400).send('Bad Request: Images and ID are required!');
      return;
    }

    try {
      await base64ImageContent(client, caption, base64Images, id);
      const name = await getChatName(client, id);
      res.send(`Message sent successfully to ${name}!`);
    } catch (error) {
      res.status(500).send(`Failed to send message: ${error}`);
    }
  });
} 