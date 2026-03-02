# 🚀 10FastFingers Helper
Chrome browser extension for **10fastfingers.com** that helps you type only correct words during typing tests.
> ⚠️ For educational purposes only.
---
## ✨ Features
* Highlights correct words
* Helps avoid typos
* Optional anti-cheat bypass via local host script
---
## 📦 Installation (Default Usage)
### 1️⃣ Clone the repository
```bash
git clone https://github.com/Lxame/10fastfingers-helper.git
cd 10fastfingers-helper
```
### 2️⃣ Load the extension in Chrome
1. Open **chrome://extensions/**
2. Enable **Developer mode** (top right corner)
3. Click **Load unpacked**
4. Select the folder:
```
./typing-assistant/extension
```
Done ✅
---
## 🛠 Anti-Cheat Mode (Advanced)
The anti-cheat bypass requires **Node.js** and **Yarn**.
### Requirements
* Node.js (v16+ recommended)
* Yarn
Check versions:
```bash
node -v
yarn -v
```
---
### Setup
Follow default installation steps first.
Then:
```bash
cd host
```
### 1️⃣ Configure download directory
Open:
```
host/imt-text-recognize.js
```
Change the variable:
```js
downloadDir = "YOUR_DOWNLOAD_FOLDER_PATH"
```
Example (Windows):
```js
downloadDir = "C:/Users/John/Downloads"
```
Example (Mac/Linux):
```js
downloadDir = "/Users/john/Downloads"
```
---
### 2️⃣ Install dependencies
```bash
yarn install
```
---
### 3️⃣ Start host script
```bash
yarn start
```
The anti-cheat mode should now be active.
---
## 📁 Project Structure
```
typing-assistant/
  ├── extension/    # Chrome extension files
  └── host/         # Local host script (anti-cheat mode)
```
---
## ⚠️ Important Notes
* Works only in **Google Chrome**
* Requires **Developer Mode**
* Anti-cheat mode requires local Node.js server running
* Tested on latest Chrome version
---
## 🧠 Troubleshooting
If the extension does not load:
* Make sure you selected the correct folder
* Check Chrome console for errors
* Try reloading the extension
If Yarn fails:
```bash
rm -rf node_modules yarn.lock
yarn
```
---