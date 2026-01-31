document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    
    // При открытии popup проверяем активную вкладку
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0] || !tabs[0].url.includes('10fastfingers')) {
            toggleBtn.textContent = 'Откройте сайт';
            toggleBtn.disabled = true;
            return;
        }
        
        // НЕ пытаемся отправить сообщение - просто показываем инструкцию
        toggleBtn.textContent = 'Используйте кнопку на странице';
        toggleBtn.disabled = true;
    });
    
    // Кнопка в popup просто открывает страницу
    toggleBtn.onclick = function() {
        chrome.tabs.create({url: 'https://10fastfingers.com'});
    };
});