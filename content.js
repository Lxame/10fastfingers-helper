// 10FastFingers Helper - основной скрипт
console.log('10FastFingers Helper загружен!');

class FastFingersHelper {
    constructor() {
        this.enabled = false;
        this.words = [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.isTyping = false;
        
        this.loadState();
        this.init();
    }
    
    loadState() {
        chrome.storage.local.get(['enabled'], (result) => {
            this.enabled = result.enabled || false;
            this.updateButton();
        });
    }
    
    saveState() {
        chrome.storage.local.set({ enabled: this.enabled });
    }
    
    init() {
        console.log('Инициализация помощника...');
        
        // Слушаем сообщения от popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'toggle') {
                this.toggle();
                sendResponse({ enabled: this.enabled });
            } else if (message.type === 'getStatus') {
                sendResponse({ enabled: this.enabled });
            } else if (message.type === 'startTyping') {
                this.startTyping();
                sendResponse({ started: true });
            }
            return true;
        });
        
        // Создаем кнопку на странице
        this.createButton();
        
        // Периодически проверяем наличие слов
        setInterval(() => {
            if (this.enabled) {
                this.checkForWords();
            }
        }, 2000);
    }
    
    createButton() {
        // Удаляем старую кнопку, если есть
        const oldButton = document.getElementById('ffh-button');
        if (oldButton) oldButton.remove();
        
        // Создаем кнопку
        this.button = document.createElement('button');
        this.button.id = 'ffh-button';
        this.button.textContent = 'FFH: OFF';
        this.button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 999999;
            padding: 8px 15px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s;
        `;
        
        this.button.addEventListener('click', () => {
            this.toggle();
        });
        
        document.body.appendChild(this.button);
        this.updateButton();
    }
    
    updateButton() {
        if (!this.button) return;
        
        if (this.enabled) {
            this.button.textContent = 'FFH: ON';
            this.button.style.background = '#28a745';
        } else {
            this.button.textContent = 'FFH: OFF';
            this.button.style.background = '#dc3545';
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.saveState();
        this.updateButton();
        
        if (this.enabled) {
            console.log('Помощник включен');
            this.checkForWords();
        } else {
            console.log('Помощник выключен');
            this.stopTyping();
        }
    }
    
    checkForWords() {
        if (!this.enabled || this.isTyping) return;
        
        console.log('Проверяю наличие слов...');
        
        // Пробуем разные способы найти слова
        let foundWords = this.getWordsMethod1();
        
        if (!foundWords || foundWords.length < 5) {
            foundWords = this.getWordsMethod2();
        }
        
        if (!foundWords || foundWords.length < 5) {
            foundWords = this.getWordsMethod3();
        }
        
        if (foundWords && foundWords.length >= 5) {
            this.words = foundWords;
            console.log(`Найдено ${this.words.length} слов:`, this.words.slice(0, 5).join(' '));
            
            // Автоматически начинаем ввод, если пользователь уже печатает
            if (this.isUserTyping()) {
                console.log('Пользователь начал печатать, начинаю автоматический ввод...');
                this.startTyping();
            }
        }
    }
    
    getWordsMethod1() {
        // Основной метод для 10fastfingers
        try {
            const wordSpans = document.querySelectorAll('#words span');
            if (wordSpans.length > 0) {
                return Array.from(wordSpans)
                    .map(span => span.textContent.trim())
                    .filter(text => text.length > 0);
            }
        } catch (e) {}
        return null;
    }
    
    getWordsMethod2() {
        // Альтернативный метод
        try {
            const wordDivs = document.querySelectorAll('.highlight');
            if (wordDivs.length > 0) {
                return Array.from(wordDivs)
                    .map(div => div.textContent.trim())
                    .filter(text => text.length > 0);
            }
        } catch (e) {}
        return null;
    }
    
    getWordsMethod3() {
        // Резервный метод - ищем все элементы с текстом
        try {
            const allElements = document.querySelectorAll('#row1 *');
            const words = [];
            
            for (const el of allElements) {
                const text = el.textContent.trim();
                if (text && text.length > 1 && text.length < 20) {
                    words.push(text);
                }
            }
            
            return words.length > 5 ? words : null;
        } catch (e) {}
        return null;
    }
    
    isUserTyping() {
        // Проверяем, начал ли пользователь печатать
        const inputField = this.getInputField();
        if (!inputField) return false;
        
        return inputField.value.length > 0 || 
               document.activeElement === inputField;
    }
    
    getInputField() {
        // Находим поле ввода
        let inputField = document.querySelector('#inputfield');
        
        if (!inputField) {
            inputField = document.querySelector('#typing-input');
        }
        
        if (!inputField) {
            inputField = document.querySelector('input[type="text"]');
        }
        
        return inputField;
    }
    
    startTyping() {
        if (this.isTyping || !this.enabled || this.words.length === 0) {
            return;
        }
        
        console.log('Начинаю автоматический ввод...');
        this.isTyping = true;
        this.currentIndex = 0;
        
        const inputField = this.getInputField();
        if (!inputField) {
            console.error('Поле ввода не найдено!');
            this.isTyping = false;
            return;
        }
        
        // Фокус на поле ввода
        inputField.focus();
        
        // Начинаем ввод с небольшой задержкой
        setTimeout(() => {
            this.typeNextWord(inputField);
        }, 500);
    }
    
    typeNextWord(inputField) {
        if (!this.isTyping || this.currentIndex >= this.words.length) {
            this.stopTyping();
            return;
        }
        
        const word = this.words[this.currentIndex];
        console.log(`Ввожу слово ${this.currentIndex + 1}/${this.words.length}: "${word}"`);
        
        // Вводим слово по буквам (более естественно)
        this.typeWordSlowly(word, inputField, () => {
            this.currentIndex++;
            
            // Добавляем пробел, если это не последнее слово
            if (this.currentIndex < this.words.length) {
                setTimeout(() => {
                    inputField.value += ' ';
                    this.triggerInputEvent(inputField);
                    
                    // Следующее слово с задержкой
                    setTimeout(() => {
                        this.typeNextWord(inputField);
                    }, Math.random() * 50 + 50); // Случайная задержка 50-100ms
                }, Math.random() * 30 + 20);
            } else {
                // Все слова введены
                setTimeout(() => {
                    this.stopTyping();
                    console.log('Автоматический ввод завершен!');
                }, 500);
            }
        });
    }
    
    typeWordSlowly(word, inputField, callback) {
        let index = 0;
        
        const typeNextChar = () => {
            if (index >= word.length) {
                callback();
                return;
            }
            
            const char = word.charAt(index);
            inputField.value += char;
            this.triggerInputEvent(inputField);
            index++;
            
            // Задержка между символами (случайная, как у человека)
            const delay = Math.random() * 40 + 30; // 30-70ms
            setTimeout(typeNextChar, delay);
        };
        
        typeNextChar();
    }
    
    triggerInputEvent(element) {
        // Триггерим события ввода
        const events = ['input', 'keydown', 'keypress', 'keyup', 'change'];
        
        events.forEach(eventType => {
            const event = new Event(eventType, {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        });
    }
    
    stopTyping() {
        this.isTyping = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Запускаем помощник
let helper;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        helper = new FastFingersHelper();
    });
} else {
    helper = new FastFingersHelper();
}