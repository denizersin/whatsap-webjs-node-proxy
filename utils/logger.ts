import fs from 'fs';

export function logWithDate(message: string): string {
    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const logMessage = `- ${date} - ${message}`;
    fs.appendFileSync('logs/status.log', logMessage + '\n');
    return logMessage;
} 