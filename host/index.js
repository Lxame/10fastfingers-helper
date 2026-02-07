import { recognizeFromFile } from './img-text-recognizer.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// allow requests from anywhere
app.use(cors());

// parse JSON
app.use(express.json());

// test endpoint
app.get('/ping', (req, res) => {
    console.log('[HOST] Getting test request');
    res.json({ ok: true });
});

app.post('/ocr_file', (req, res) => {
    const filename = req.body.filename;
    console.log(`[HOST] Request to recognize image: ${filename}`);
    
    const text = recognizeFromFile(filename)
        .then(text => {
            console.log(text);
            res.json({ 
                ok: true,
                text: text 
            });
        })
        .catch(error => {
            console.error(error)
            res.json({ 
                ok: false,
                text: error 
            });
        });
});

app.listen(PORT, () => {
    console.log(`[HOST] Server running at http://localhost:${PORT}`);
});
