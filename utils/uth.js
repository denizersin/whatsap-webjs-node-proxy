require('dotenv').config();

function verifyKey(req, res, next) {
    const authHeader = req.headers['authorization'];
    const validApiKey = process.env.API_KEY;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized! Bearer token required!');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token !== validApiKey) {
        return res.status(401).send('Unauthorized! Invalid API Key!');
    }

    next();
}

module.exports = verifyKey;