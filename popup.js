document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');
    const wordCount = document.getElementById('wordCount');
    const stats = document.getElementById('stats');
    
    // Запрашиваем статус у content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0] || !tabs[0].url.includes('10fastfingers')) {
            statusText.textContent = 'Откройте 10fastfingers.com';
            toggleBtn.disabled = true;
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {type: 'getStatus'}, function(response) {
            if (chrome.runtime.lastError) {
                statusText.textContent = 'Обновите страницу';
                return;
            }
            
            updateUI(response.enabled);
        });
    });
    
    // Обработка клика по кнопке
    toggleBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'toggle'}, function(response) {
                if (response) {
                    updateUI(response.enabled);
                }
            });
        });
    });
    
    function updateUI(enabled) {
        if (enabled) {
            toggleBtn.textContent = 'ВЫКЛЮЧИТЬ';
            toggleBtn.classList.remove('off');
            toggleBtn.classList.add('on');
            statusText.textContent = 'Включен';
            statusText.style.color = '#4CAF50';
        } else {
            toggleBtn.textContent = 'ВКЛЮЧИТЬ';
            toggleBtn.classList.remove('on');
            toggleBtn.classList.add('off');
            statusText.textContent = 'Выключен';
            statusText.style.color = '#f44336';
        }
    }
    
    // Периодически обновляем статистику
    setInterval(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) return;
            
            chrome.tabs.sendMessage(tabs[0].id, {type: 'getWordsCount'}, function(response) {
                if (response && response.count > 0) {
                    wordCount.textContent = response.count;
                    stats.style.display = 'block';
                }
            });
        });
    }, 1000);
});