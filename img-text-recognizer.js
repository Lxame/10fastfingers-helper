import { createWorker } from 'tesseract.js';
import fs from 'fs';

const downloadDir = 'C:/Users/Matvey/Downloads/10fastfingers/';

export async function recognizeFromFile(filename) {
    try {
        const worker = await createWorker('rus');

        const imageBuffer = fs.readFileSync(downloadDir + filename);
        const { data: { text } } = await worker.recognize(imageBuffer);
        
        await worker.terminate();
        return text;
    } catch (error) {
        console.error('Ошибка OCR:', error);
        return null;
    }
}