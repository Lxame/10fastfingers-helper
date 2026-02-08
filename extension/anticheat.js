//======================================================================
//   10FASTFINGERS ANTICHEAT
//======================================================================
let isAnticheatEnabled = false;
let startBtn = null;
let textArea = null;
let imgDiv = null;
let anticheatWords = [];
//======================================================================
const timeInterval = 10; 
//======================================================================
function createAnticheatButton() {
    const anticheatButton = document.createElement('anticheat-button');
    anticheatButton.id = 'ff-anticheat-btn';
    anticheatButton.textContent = isAnticheatEnabled ? 'OFF' : 'ON';
    anticheatButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        padding: 10px 15px;
        background: ${isAnticheatEnabled ? '#ff0000' : '#00ff00'};
        opacity: 0.5;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        font-family: Arial, sans-serif;
    `;
    
    anticheatButton.onclick = () => {
        isAnticheatEnabled = !isAnticheatEnabled;
        anticheatButton.textContent = isAnticheatEnabled ? 'OFF' : 'ON';
        anticheatButton.style.background = isAnticheatEnabled ? '#ff0000' : '#00ff00';
        
        if (isAnticheatEnabled) {
            console.log('[FF] Anticheat on');
            startAnticheat();
        } else {
            console.log('[FF] Anticheat off');
            stopAnticheat();
        }
    };
    
    document.body.appendChild(anticheatButton);
}
//======================================================================
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
//======================================================================
function configureTextArea() {
    const originalFocus = textArea.onfocus;
    const originalBlur = textArea.onblur;

    textArea.onfocus = function(e) {
        console.log('[FF] Text area in focus');
        if (originalFocus) originalFocus.call(this, e);
    };

    textArea.onblur = function(e) {
        console.log('[FF] Text area loss focus');
        setTimeout(() => {
            if (isAnticheatEnabled && textArea) {
                textArea.focus();
            }
        }, 10);
        if (originalBlur) originalBlur.call(this, e);
    };

    // main input handler
    let lastKeyTime = 0;
    
    textArea.onkeydown = function(e) {
        if (!isAnticheatEnabled || anticheatWords.length === 0) return true;
        
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
        if (currentWordIndex >= anticheatWords.length) {
            console.log('[FF] All words are entered');
            return false;
        }
        
        const currentWord = anticheatWords[currentWordIndex];
        console.log(`[FF] Current word: "${currentWord}"`);
        
        // word end
        if (currentCharIndex >= currentWord.length) {
            console.log(`[FF] Word "${currentWord}" are entered`);
            
            const spaceEvent = new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                bubbles: true
            });
            
            this.value += ' ';
            this.dispatchEvent(spaceEvent);
            
            // next word
            currentWordIndex++;
            currentCharIndex = 0;

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
    
    console.log('[FF] Text area configuring is completed');
}

function configureStartButton(){
    startBtn.onclick = function(e) {
        const img = imgDiv.querySelector('img');
        if (img) {
            console.log(`[FF] Image extracted, src: "${img.src}"`);

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
            .slice(0, 19); // "yyyy-mm-dd_hh-mm-ss"
            filename += ".png";

            console.log(`[FF] Filename "${filename}"`);
            handleImgElement(img, filename);
        }
        else {
            console.error('[FF] Failed to get image');
        }
    }

    console.log('[FF] "Start" button configuring is completed');
}
//======================================================================
async function handleImgElement(img, filename = 'image.png') {
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
            type: 'DOWNLOAD_AND_RECOGNIZE_IMAGE',
            dataUrl: dataUrl,
            filename: filename
        },
        response => {
            anticheatWords = response.response.text
                .toLowerCase()
                .replace(/[^a-zA-Zа-яА-ЯёЁ\s]/g, '') // only letters
                .trim()
                .split(/\s+/);
            console.log(`[FF] Anticheat words: ${anticheatWords}`);
        }
    );
}
//======================================================================
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
    console.log('[FF] Start anticheat...');

    resetParams();

    if (!findStartButton()) {
        console.error('[FF] Failed to get "Start" button');
        return;
    }

    if (!findTextArea()) {
        console.error('[FF] Failed to get text area');
        return;
    }

    if (!findImageDiv()) {
        console.error('[FF] Failed to get imgDiv');
        return;
    }

    configureTextArea();
    configureStartButton();

    console.log('[FF] Anticheat ready to use!');
}

function stopAnticheat()
{
    console.log('[FF] Anticheat stoped');
    resetParams();
}
//======================================================================
function init() {
    console.log('[FF] Anticheat initialization');
    createAnticheatButton();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
//======================================================================