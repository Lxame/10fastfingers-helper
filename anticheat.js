// ============================================
// 10FASTFINGERS ANTICHEAT
// ============================================

console.log('[FF] Античит активирован');

let isAnticheatEnabled = false;
let startBtn = null;
let textArea = null;
let imgDiv = null;
let anticheatWords = [];

const timeInterval = 10; 

function createAnticheatButton() {
    const anticheatButton = document.createElement('anticheat-button');
    anticheatButton.id = 'ff-anticheat-btn';
    anticheatButton.textContent = isAnticheatEnabled ? 'ВЫКЛ' : 'ВКЛ';
    anticheatButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        padding: 10px 15px;
        background: ${isAnticheatEnabled ? '#ff0000' : '#00ff00'};
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    
    anticheatButton.onclick = () => {
        isAnticheatEnabled = !isAnticheatEnabled;
        anticheatButton.textContent = isAnticheatEnabled ? 'ВЫКЛ' : 'ВКЛ';
        anticheatButton.style.background = isAnticheatEnabled ? '#ff0000' : '#00ff00';
        
        if (isAnticheatEnabled) {
            console.log('[FF] Античит включен');
            startAnticheat();
        } else {
            console.log('[FF] Античит выключен');
            stopAnticheat();
        }
    };
    
    document.body.appendChild(anticheatButton);
}

function findStartButton() {
    startBtn = document.getElementById('start-btn');
    return startBtn !== null;
}

function findTextArea() {
    textArea = document.getElementById('word-input');
    return textArea !== null;
}

function findImageDiv() {
    imgDiv = document.getElementById('word-img');
    return imgDiv !== null;
}

function configureTextArea() {
    const originalFocus = textArea.onfocus;
    const originalBlur = textArea.onblur;

    textArea.onfocus = function(e) {
        console.log('[FF] Поле ввода в фокусе');
        if (originalFocus) originalFocus.call(this, e);
    };

    textArea.onblur = function(e) {
        console.log('[FF] Поле ввода потеряло фокус');
        setTimeout(() => {
            if (isAnticheatEnabled && textArea) {
                textArea.focus();
            }
        }, 10);
        if (originalBlur) originalBlur.call(this, e);
    };

    // Основной обработчик ввода
    let lastKeyTime = 0;
    
    textArea.onkeydown = function(e) {
        if (!isAnticheatEnabled || anticheatWords.length === 0) return true;
        
        // Защита от слишком быстрых нажатий
        const now = Date.now();
        if (now - lastKeyTime < timeInterval) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        lastKeyTime = now;
        
        console.log(`[FF] Нажата клавиша: "${e.key}"`);
        
        // Блокируем
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Backspace
        if (e.key === 'Backspace') {
            this.value = this.value.slice(0, -1);
            if (currentCharIndex > 0) {
                currentCharIndex--;
            }
            return false;
        }
        
        // Конец слов
        if (currentWordIndex >= anticheatWords.length) {
            console.log('[FF] Все слова введены');
            return false;
        }
        
        const currentWord = anticheatWords[currentWordIndex];
        console.log(`[FF] Слово: "${currentWord}"`);
        console.log(`[FF] Индекс: "${currentWordIndex}"`);
        
        // Если слово закончилось
        if (currentCharIndex >= currentWord.length) {
            console.log(`[FF] Слово "${currentWord}" завершено`);
            
            // Создаем событие пробела
            const spaceEvent = new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                bubbles: true
            });
            
            this.value += ' ';
            this.dispatchEvent(spaceEvent);
            
            // Переходим к следующему слову
            currentWordIndex++;
            currentCharIndex = 0;

            return false;
        }
        
        // Игнорируем служебные клавиши
        if (e.key.length > 1) return false;
        
        // Вводим правильную букву
        const correctChar = currentWord[currentCharIndex];
        console.log(`[FF] Вводим: "${correctChar}"`);
        
        // Добавляем букву
        this.value += correctChar;
        
        // Создаем событие для буквы
        const charEvent = new KeyboardEvent('keyup', {
            key: correctChar,
            code: `Key${correctChar.toUpperCase()}`,
            keyCode: correctChar.charCodeAt(0),
            bubbles: true
        });
        
        this.dispatchEvent(charEvent);
        
        // Увеличиваем счетчик
        currentCharIndex++;
        
        return false;
    };
    
    console.log('[FF] Настройка поля ввода завершена');
}

function configureStartButton(){
    startBtn.onclick = function(e) {
        const img = imgDiv.querySelector('img');
        if (img) {
            console.log('[FF] Изображение получено');
            console.log(`[FF] Image src: "${img.src}"`);

            chrome.runtime.sendMessage(
                {
                    type: 'PING',
                },
                response => {
                    console.log(response);
                }
            );
            
            const now = new Date();
            let filename = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, 19); // "2024-02-19_11-30-45"
            filename += ".png";

            saveImgFromElement(img, filename);
        }
        else {
            console.log('[FF::Error] Не удалось получить изображение');
        }
    }

    console.log('[FF] Настройка кнопки "Start" завершена');
}

function resetParams() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    anticheatWords = [];

    if (startBtn){
        startBtn.onclick = null;
    }

    if (textArea) {
        textArea.onkeydown = null;
        textArea.onfocus = null;
        textArea.onblur = null;
    }

    startBtn = null;
    textArea = null;
    imgDiv = null;
}

function startAnticheat() {
    console.log('[FF::Info] Запуск античита...');

    resetParams();

    if (!findStartButton()) {
        console.log('[FF::Error] Не удалось получить кнопку "Старт"');
        return;
    }

    if (!findTextArea()) {
        console.log('[FF::Error] Не удалось получить поле ввода');
        return;
    }

    if (!findImageDiv()) {
        console.log('[FF::Error] Не удалось получить imgDiv');
        return;
    }

    configureTextArea();
    configureStartButton();
}

function stopAnticheat()
{
    console.log('[FF] Остановка античита');
    resetParams();
}

function init() {
    console.log('[FF] Инициализация античита');
    createAnticheatButton();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

async function saveImgFromElement(img, filename = 'image.png') {
    if (!img.complete) {
        await new Promise(r => img.onload = r);
    }

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');

    chrome.runtime.sendMessage(
        {
            type: 'DOWNLOAD_IMAGE',
            dataUrl: dataUrl,
            filename: filename
        },
        response => {
            anticheatWords = response.response.text
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s]+/gu, '') // только буквы и цифры
                .trim()
                .split(/\s+/);
            console.log(anticheatWords);
        }
    );
}
