chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {    
        if (msg.type === 'PING') {
            sendResponse({ ok: true });
        }
        else if (msg.type === 'API_TEST') {
            fetch('http://localhost:3000/ping', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(r => r.json())
            .then(data => { sendResponse({ response: data }); })
            .catch(error => { sendResponse({ error: error.message }); });
        }
        else if (msg.type === 'OCR') {
            fetch('http://localhost:3000/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imgUrl: msg.imgUrl,
                    buffer: msg.buffer
                })
            })
            .then(r => r.json())
            .then(data => { sendResponse({ response: data }); })
            .catch(error => { sendResponse({ error: error.message }); });
        }
        else if (msg.type === 'DOWNLOAD_IMAGE') {
            chrome.downloads.download({
                url: msg.dataUrl,
                filename: `10fastfingers/${msg.filename}`, // 📁 папка!
                saveAs: false
            });
            fetch('http://localhost:3000/ocr_file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: msg.filename
                })
            })
            .then(r => r.json())
            .then(data => { sendResponse({ response: data }); })
            .catch(error => { sendResponse({ error: error.message }); });
        }
    })();

    return true;
});