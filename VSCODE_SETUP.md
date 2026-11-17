# Running ScholarSpark AI in Visual Studio Code

Follow these steps to open and run **ScholarSpark AI** locally in VS Code:

## 1. Prerequisites
- **Node.js 20+** (or Node 22 LTS) installed (`node -v` in terminal)
- **Visual Studio Code**
- A **Gemini API key** from Google AI Studio (`https://aistudio.google.com/apikey`) for live AI features (Tutor, Homework Scanner, Practice Generator, Flashcards, Notes Summarizer, Timetable Generator)

## 2. Extract & Open in VS Code
1. Unzip `ScholarSpark-AI-VSCode.zip` to a folder on your computer.
2. Open **Visual Studio Code**, click **File > Open Folder...**, and select the extracted folder (or run `code .` inside the folder).
3. If VS Code asks to install recommended extensions (`.vscode/extensions.json`), click **Install**.

## 3. Install Dependencies
Open the integrated terminal in VS Code (**Ctrl + `** or **Terminal > New Terminal**) and run:

```bash
npm install
```

> **Windows PowerShell note:** If you see `npm.ps1 cannot be loaded because running scripts is disabled`, either switch the VS Code terminal to **Command Prompt (`cmd`)** or use `npm.cmd install` and `npm.cmd run dev` instead of `npm`.

## 4. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   - **macOS / Linux / Git Bash:** `cp .env.example .env`
   - **Windows PowerShell:** `Copy-Item .env.example .env`
2. Open `.env` and set your Gemini API key (kept strictly server-side in `server.ts`):
   ```env
   GEMINI_API_KEY="your-actual-gemini-api-key"
   PORT="3000"
   NODE_ENV="development"
   ```

> Never commit `.env` to GitHub—`.gitignore` automatically excludes it.

## 5. Run the Application
Either press **F5** in VS Code (uses `.vscode/launch.json`) or run in the VS Code terminal:

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

## 6. Useful Commands
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Express backend + Vite React frontend on port 3000 |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) |
| `npm test` | Runs backend and curriculum automated tests |
| `npm run build` | Builds production bundle into `dist/` |
| `npm run build:pages` | Builds static GitHub Pages bundle into `docs/` |
| `npm start` | Serves the production build from `dist/` + API routes |
