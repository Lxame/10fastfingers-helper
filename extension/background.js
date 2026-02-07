chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {    
        if (msg.type === 'PING') {
            fetch('http://localhost:3000/ping', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(r => r.json())
            .then(data => { sendResponse({ response: data }); })
            .catch(error => { sendResponse({ error: error.message }); });
        }
        else if (msg.type === 'DOWNLOAD_AND_RECOGNIZE_IMAGE') {
            chrome.downloads.download({
                url: msg.dataUrl,
                filename: `10fastfingers/${msg.filename}`,
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