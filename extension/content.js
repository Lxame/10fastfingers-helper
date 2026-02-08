//======================================================================
//   10FASTFINGERS HELPER
//======================================================================
console.log('[FF] Extension loaded');
//======================================================================
let enabled = false;
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let inputField = null;
//======================================================================
const timeInterval = 10;
//======================================================================
function createControlButton() {
    const button = document.createElement('button');
    button.id = 'ff-helper-btn';
    button.textContent = enabled ? 'OFF' : 'ON';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        padding: 10px 15px;
        background: ${enabled ? '#ff0000' : '#00ff00'};
        opacity: 0.5;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        font-family: Arial, sans-serif;
    `;
    
    button.onclick = () => {
        enabled = !enabled;
        button.textContent = enabled ? 'OFF' : 'ON';
        button.style.background = enabled ? '#ff0000' : '#00ff00';
        
        if (enabled) {
            console.log('[FF] On');
            startHelper();
        } else {
            console.log('[FF] Off');
            stopHelper();
        }
    };
    
    document.body.appendChild(button);
}
//======================================================================
function getWords() {
    try {
        const wordSpans = document.querySelectorAll('#words span');
        for (const span of wordSpans) {
            const text = span.textContent.trim();
            if (text) words.push(text);
        }
        
        if (words.length === 0) {
            console.log('[FF] Words not found');
        }
        else {
            console.log(`[FF] Founded ${words.length} words: ${words}`);
        }
    } catch (error) {
        console.error('[FF] Failed getting words:', error);
    }
}
//======================================================================
function findInputField() {
    inputField = document.getElementById('inputfield');
    return inputField !== null;
}
//======================================================================
function configureInputField() {
    // clean field
    inputField.value = '';
    inputField.focus();

    // save original focus/blur
    const originalFocus = inputField.onfocus;
    const originalBlur = inputField.onblur;

    inputField.onfocus = function(e) {
        console.log('[FF] Input field in focus');
        if (originalFocus) originalFocus.call(this, e);
    };
    
    inputField.onblur = function(e) {
        console.log('[FF] Input field loss focus');
        setTimeout(() => {
            if (enabled && inputField) {
                inputField.focus();
            }
        }, 10);
        if (originalBlur) originalBlur.call(this, e);
    };

    // main input handler
    let lastKeyTime = 0;
    
    inputField.onkeydown = function(e) {
        if (!enabled || words.length === 0) return true;
        
        // typing delay
        const now = Date.now();
        if (now - lastKeyTime < timeInterval) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        lastKeyTime = now;
        
        console.log(`[FF] Key pressed: "${e.key}"`);
        
        // block
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // backspace
        if (e.key === 'Backspace') {
            this.value = this.value.slice(0, -1);
            if (currentCharIndex > 0) {
                currentCharIndex--;
            }
            return false;
        }
        
        // all words done
        if (currentWordIndex >= words.length) {
            console.log('[FF] All words are entered');
            return false;
        }
        
        const currentWord = words[currentWordIndex];
        console.log(`[FF] Current word: "${currentWord}" with index: ${currentWordIndex}`);
        
        // word end
        if (currentCharIndex >= currentWord.length) {
            console.log(`[FF] Word "${currentWord}" are entered`);
            
            const spaceEvent = new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                bubbles: true
            });
            
            this.dispatchEvent(spaceEvent);
            
            // next word
            currentWordIndex++;
            currentCharIndex = 0;
            this.value = '';
            
            return false;
        }
        
        // ignoring the service keys
        if (e.key.length > 1) return false;
        
        // entering the correct letter
        const correctChar = currentWord[currentCharIndex];
        console.log(`[FF] Append: "${correctChar}"`);
        
        // append letter
        this.value += correctChar;
        
        const charEvent = new KeyboardEvent('keyup', {
            key: correctChar,
            code: `Key${correctChar.toUpperCase()}`,
            keyCode: correctChar.charCodeAt(0),
            bubbles: true
        });
        
        this.dispatchEvent(charEvent);
        
        currentCharIndex++;
        
        return false;
    };

    console.log('[FF] Input field configuring is completed');
}
//======================================================================
function resetParams(){
    currentWordIndex = 0;
    currentCharIndex = 0;
    words = [];

    if (inputField) {
        inputField.onkeydown = null;
        inputField.onkeyup = null;
        inputField.onfocus = null;
        inputField.onblur = null;
    }

    inputField = null;
}

function startHelper() {
    console.log('[FF] Helper is starting...');
    
    resetParams();
    getWords();
    
    if (!findInputField()) {
        console.error('[FF] Failed to get input field');
        return;
    }

    configureInputField();
    
    console.log('[FF] Helper ready to use!');
}

function stopHelper() {
    console.log('[FF] Helper stoped');
    resetParams();
}
//======================================================================
function init() {
    console.log('[FF] Init extension');
    createControlButton();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
//======================================================================