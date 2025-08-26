import 'dotenv/config';
import qrcode from 'qrcode-terminal';
import Whatsapp, { Message } from 'whatsapp-web.js';
import { logWithDate } from './utils/logger.js';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { exec } from 'child_process';
import { Server } from 'http';

const { Client, LocalAuth } = Whatsapp;


const app = express();
const { PORT = 3113 } = process.env;

const SERVER_URL = `https://${process.env.SERVER_URL}`;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

console.log(process.env.PUPETTER_EXECUTABLE_PATH,'pupetter executable path. this should be google chrome and accurate path for it.')
const client = new Client({
  puppeteer: {
    executablePath: process.env.PUPETTER_EXECUTABLE_PATH,
    headless: true,
    args: [
      '--disable-accelerated-2d-canvas',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-cache',
      '--disable-component-extensions-with-background-pages',
      '--disable-crash-reporter',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-mojo-local-storage',
      '--disable-notifications',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-software-rasterizer',
      '--ignore-certificate-errors',
      '--log-level=3',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--renderer-process-limit=100',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
    ],
  },
  authStrategy: new LocalAuth(),
  // dataPath: 'session',
});

routes(app, client);

client.initialize();

client.on('qr', (qr: string) => qrcode.generate(qr, { small: true }));
client.on('loading_screen', (percent: number, message: string) => {
  log(`Loading: ${percent}% - ${message}`);
});
client.on('auth_failure', () => log('Authentication failure!'));
client.on('disconnected', () => log('Client disconnected!'));
client.on('authenticated', () => log('Client authenticated!'));
client.on('ready', async () => {
  startServer()
});

client.on('message', async (message) => {
  const { body, from, hasMedia } = message;
  let media = null;
  if (hasMedia) {
    // media = await message.downloadMedia();
    // console.log(media, 'media');
  }


  // try {

  //   //send message to server
  //   await fetch(`${SERVER_URL}/handle-message`, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       media: hasMedia ? {
  //         mimetype: media?.mimetype,
  //         data: media?.data,
  //         filename: media?.filename,
  //         filesize: media?.filesize,
  //       } : null,
  //       from: from,
  //       body: body,
  //     }),
  //   });
  // }
  // catch (error) {
  //   console.log(error, 'error while sending message to server');
  // }



  if (body === '!ping') return handlePing(message, from);
  if (body === '!logs') return handleLogs(message, from);
  if (body.startsWith('!deleteMessage,'))
    return handleDeleteMessage(message, body);
  if (body === '!jadwaldeo') return handleSchedule(message, from);
});

function log(message: string) {
  logWithDate(message);
  console.log(message);
}

function startServer() {
  log('WhatsApp API is ready to use!');

  const server = app.listen(PORT, () => log(`Server running on port ${PORT}`));
  server.on('error', handleError(server));
}

function handleError(server: Server) {
  return (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use, trying another port...`);
      server.listen(0);
    } else {
      throw err;
    }
  };
}

async function handlePing(message: Message, from: string) {
  message.reply('pong');
  log(`${from}: pinged!`);
}

function handleLogs(message: Message, from: string) {
  fs.readFile('logs/status.log', 'utf8', (err, data) => {
    if (err) return;
    const recentLines = data.trim().split('\n').slice(-10).join('\n');
    message.reply(recentLines);
    log(`${from}: !logs`);
  });
}

async function handleDeleteMessage(message: Message, body: string) {
  const messageID = body.split(',')[1];
  try {
    const msg = await client.getMessageById(messageID);
    if (msg.fromMe) {
      msg.delete(true);
      message.reply(`Message with ID ${messageID} has been deleted!`);
      log(`Message with ID ${messageID} has been deleted!`);
    }
  } catch (error) {
    log(`Error getting message: ${error}`);
  }
}

// Example function to interact with Python script
// This function assumes you have a Python script named getSchedule.py
async function handleSchedule(message: Message, from: string) {
  exec('python3 getSchedule.py', (error, stdout) => {
    if (error) {
      log(`Error getting schedule: ${error}`);
      return;
    }
    message.reply(stdout);
    log(`Sending schedule to ${from}`);
  });
}
