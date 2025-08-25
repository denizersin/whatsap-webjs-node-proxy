import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

export function verifyKey(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const validApiKey = process.env.API_KEY;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized! Bearer token required!');
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token || token !== validApiKey) {
        res.status(401).send('Unauthorized! Invalid API Key!');
        return;
    }

    next();
} 