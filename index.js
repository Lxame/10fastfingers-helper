import { recognizeFromFile } from './img-text-recognizer.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// разрешаем запросы откуда угодно (для расширений это ок)
app.use(cors());

// парсим JSON
app.use(express.json());

// тестовый endpoint
app.get('/ping', (req, res) => {
    console.log('Получен тестовый запрос');
    res.json({ ok: true });
});

// основной обработчик
app.post('/ocr', (req, res) => {
    const imgUrl = req.body.imgUrl;
    console.log(`Получен запрос обработку изображения: ${imgUrl}`);
    res.json({ ok: true });
});

app.post('/ocr_file', (req, res) => {
    const filename = req.body.filename;
    console.log(`Получен запрос обработку изображения: ${filename}`);
    
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
    console.log(`Server running at http://localhost:${PORT}`);
});
