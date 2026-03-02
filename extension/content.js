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
let reloadBtn = null;
//======================================================================
const timeInterval = 10;
//======================================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "commonSwitchChanged") {
        enabled = message.enabled;
        if (message.enabled) {
            console.log('[FF] Helper On');
            startHelper();
        } else {
            console.log('[FF] Helper Off');
            stopHelper();
        }
    }
});
//======================================================================
function getWords() {
    try {
        const wordSpans = document.querySelectorAll('#words span');
        for (const span of wordSpans) {
            const text = span.textContent.trim();
            if (text) {
                words.push(text);
            }
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

function findReloadButton() {
    reloadBtn = document.getElementById('reload-btn');
    return reloadBtn !== null;
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

        if (originalFocus) {
            originalFocus.call(this, e);
        }
    };
    
    inputField.onblur = function(e) {
        console.log('[FF] Input field loss focus');
        setTimeout(() => {
            if (enabled && inputField) {
                inputField.focus();
            }
        }, 10);

        if (originalBlur) {
            originalBlur.call(this, e);
        }
    };

    // main input handler
    let lastKeyTime = 0;
    
    inputField.onkeydown = function(e) {
        if (!enabled || words.length === 0) {
            return true;
        }
        
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
}

function configureReloadButton() {
    reloadBtn.onclick = function() {
        console.log('[FF] Reload button clicked');
        setTimeout(() => {
            resetParams();
            getWords();
        }, 500);
    }
}
//======================================================================
function resetParams() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    words = [];
}

function resetControls() {
    if (inputField) {
        inputField.onkeydown = null;
        inputField.onkeyup = null;
        inputField.onfocus = null;
        inputField.onblur = null;
        inputField = null;
    }

    if (reloadBtn) {
        reloadBtn.onclick = null;
        reloadBtn = null;
    }
}

function startHelper() {
    console.log('[FF] Helper is starting...');
    
    resetParams();
    resetControls();
    getWords();
    
    if (!findInputField()) {
        console.error('[FF] Failed to get input field');
        return;
    }

    if (!findReloadButton()) {
        console.error('[FF] Failed to get reload button');
        return;
    }

    configureInputField();
    configureReloadButton();
    
    console.log('[FF] Helper ready to use!');
}

function stopHelper() {
    console.log('[FF] Helper stoped');
    resetParams();
}
//======================================================================
function init() {
    console.log('[FF] Extension initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
//======================================================================