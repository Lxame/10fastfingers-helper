// ============================================
// 10FASTFINGERS HELPER - РАБОЧАЯ ВЕРСИЯ
// ============================================

console.log('[FF] Расширение загружено');

let enabled = false;
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let inputField = null;

// Создаем кнопку управления
function createControlButton() {
    const button = document.createElement('button');
    button.id = 'ff-helper-btn';
    button.textContent = enabled ? '🔴 ВЫКЛ' : '🟢 ВКЛ';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        padding: 10px 15px;
        background: ${enabled ? '#dc3545' : '#28a745'};
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    
    button.onclick = () => {
        enabled = !enabled;
        button.textContent = enabled ? '🔴 ВЫКЛ' : '🟢 ВКЛ';
        button.style.background = enabled ? '#dc3545' : '#28a745';
        
        if (enabled) {
            console.log('[FF] Включено');
            startHelper();
        } else {
            console.log('[FF] Выключено');
            stopHelper();
        }
    };
    
    document.body.appendChild(button);
}

// Получаем слова
function getWords() {
    words = [];
    try {
        const wordSpans = document.querySelectorAll('#words span');
        for (const span of wordSpans) {
            const text = span.textContent.trim();
            if (text) words.push(text);
        }
        console.log(`[FF] Найдено ${words.length} слов`);
        console.log(`[FF] Слова ${words} слов`);
    } catch (error) {
        console.error('[FF] Ошибка получения слов:', error);
    }
}

// Находим поле ввода
function findInputField() {
    inputField = document.getElementById('inputfield');
    return inputField !== null;
}

// Запуск помощника
function startHelper() {
    console.log('[FF] Запуск помощника...');
    
    // Сбрасываем состояние
    currentWordIndex = 0;
    currentCharIndex = 0;
    
    // Получаем слова
    getWords();
    if (words.length === 0) {
        console.log('[FF] Слова не найдены');
        return;
    }
    
    // Находим поле ввода
    if (!findInputField()) {
        console.log('[FF] Поле ввода не найдено');
        return;
    }
    
    // Очищаем поле
    inputField.value = '';
    inputField.focus();
    
    // Перехватываем focus/blur чтобы не терять фокус
    const originalFocus = inputField.onfocus;
    const originalBlur = inputField.onblur;
    
    inputField.onfocus = function(e) {
        console.log('[FF] Поле ввода в фокусе');
        if (originalFocus) originalFocus.call(this, e);
    };
    
    inputField.onblur = function(e) {
        console.log('[FF] Поле ввода потеряло фокус');
        setTimeout(() => {
            if (enabled && inputField) {
                inputField.focus();
            }
        }, 10);
        if (originalBlur) originalBlur.call(this, e);
    };
    
    // Основной обработчик ввода
    let lastKeyTime = 0;
    
    inputField.onkeydown = function(e) {
        if (!enabled || words.length === 0) return true;
        
        // Защита от слишком быстрых нажатий
        const now = Date.now();
        if (now - lastKeyTime < 10) {
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
        if (currentWordIndex >= words.length) {
            console.log('[FF] Все слова введены');
            return false;
        }
        
        const currentWord = words[currentWordIndex];
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
            
            this.dispatchEvent(spaceEvent);
            
            // Переходим к следующему слову
            // currentWordIndex++;
            currentCharIndex = 0;
            
            // Очищаем поле
            this.value = '';
            
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
    
    // Также обрабатываем keyup для пробела
    inputField.onkeyup = function(e) {
        if (!enabled || words.length === 0) return true;
        
        // Если пользователь нажал пробел
        if (e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            
            // Если есть текущее слово
            if (currentWordIndex < words.length) {
                console.log(`[FF] Ручной пробел после слова "${words[currentWordIndex]}"`);
                currentWordIndex++;
                currentCharIndex = 0;
                this.value = '';
            }
            return false;
        }
        
        return true;
    };
    
    console.log('[FF] Готов! Нажимайте любые клавиши');
}

// Остановка помощника
function stopHelper() {
    console.log('[FF] Остановка помощника');
    if (inputField) {
        inputField.onkeydown = null;
        inputField.onkeyup = null;
        inputField.onfocus = null;
        inputField.onblur = null;
    }
    currentWordIndex = 0;
    currentCharIndex = 0;
}

// Инициализация
function init() {
    console.log('[FF] Инициализация расширения');
    createControlButton();
    
    // Периодически проверяем наличие слов
    setInterval(() => {
        if (enabled && words.length === 0) {
            getWords();
        }
    }, 1000);
}

// Запускаем
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}