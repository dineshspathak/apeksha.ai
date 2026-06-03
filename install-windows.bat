@echo off
REM ═══════════════════════════════════════════════════════════════
REM 🙏 Apeksha AI — Windows Installer
REM Just double-click this file or run: install-windows.bat
REM ═══════════════════════════════════════════════════════════════

echo.
echo   🙏 Apeksha AI Installer (Windows)
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Setting up your local AI code editor...
echo.

REM ─── Check/Install winget ──────────────────────────────────
where winget >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ winget not found. Please install "App Installer" from Microsoft Store.
    echo    https://apps.microsoft.com/detail/9NBLGGH4NNS1
    pause
    exit /b 1
)

REM ─── Install Python ────────────────────────────────────────
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 🐍 Installing Python...
    winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
)
echo ✅ Python ready

REM ─── Install Node.js ───────────────────────────────────────
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 📦 Installing Node.js...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)
echo ✅ Node.js ready

REM ─── Install Ollama ────────────────────────────────────────
where ollama >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 🧠 Installing Ollama...
    winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
)
echo ✅ Ollama ready

REM ─── Pull AI Model ────────────────────────────────────────
echo.
echo 🧠 Downloading AI model (llama3.1 — ~4GB, one-time)...
ollama pull llama3.1
echo ✅ AI model ready

REM ─── Setup Python Environment ─────────────────────────────
echo.
echo 📦 Installing Apeksha dependencies...
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
echo ✅ Python packages installed

REM ─── Setup Editor ─────────────────────────────────────────
echo.
echo 🖥️  Setting up editor...
cd editor
call npm install --silent
cd ..
echo ✅ Editor ready

REM ─── Create Launch Script ──────────────────────────────────
(
echo @echo off
echo echo 🙏 Starting Apeksha AI...
echo start /B ollama serve
echo timeout /t 2 /nobreak ^>nul
echo call venv\Scripts\activate.bat
echo start /B python web_ui.py
echo cd editor
echo start /B npm run dev
echo cd ..
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:3000
echo echo.
echo echo 🙏 Apeksha AI is running!
echo echo    Editor: http://localhost:3000
echo echo    Chat:   http://127.0.0.1:5000
echo echo.
echo echo    Close this window to stop.
echo pause
) > launch.bat

REM ─── Create Desktop Shortcut ───────────────────────────────
set SCRIPT_PATH=%cd%\launch.bat
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\Apeksha AI.lnk'); $s.TargetPath = '%SCRIPT_PATH%'; $s.WorkingDirectory = '%cd%'; $s.Description = 'Apeksha AI - Local Code Editor'; $s.Save()"

echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo   🙏 Apeksha AI installed successfully!
echo.
echo   A shortcut "Apeksha AI" has been created on your Desktop.
echo   Double-click it to start Apeksha.
echo.
echo ═══════════════════════════════════════════════════════════
echo.

set /p launch_now="  🚀 Launch Apeksha now? (y/n): "
if /i "%launch_now%"=="y" call launch.bat

pause
