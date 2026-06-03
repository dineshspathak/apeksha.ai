@echo off
REM ═══════════════════════════════════════════════════════════════
REM Apeksha AI — Windows Installer (Cloud Mode)
REM Double-click to install
REM ═══════════════════════════════════════════════════════════════

echo.
echo   Apeksha AI Installer (Windows)
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Setting up your AI assistant...
echo.

REM ─── Check winget ──────────────────────────────────────────
where winget >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo   Please install "App Installer" from Microsoft Store first.
    pause
    exit /b 1
)

REM ─── Install Python ────────────────────────────────────────
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo   Installing Python...
    winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
)
echo   ✅ Python ready

REM ─── Install Node.js ───────────────────────────────────────
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo   Installing Node.js...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)
echo   ✅ Node.js ready

REM ─── Setup Python Environment ─────────────────────────────
echo.
echo   Installing dependencies...
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
echo   ✅ Python packages installed

REM ─── Setup Editor ─────────────────────────────────────────
echo   Setting up editor...
cd editor
call npm install --silent
cd ..
echo   ✅ Editor ready

REM ─── Setup .env ────────────────────────────────────────────
if not exist ".env" (
    echo # Apeksha AI Configuration> .env
    echo GROQ_API_KEY=PASTE_YOUR_KEY_HERE>> .env
    echo AI_MODE=cloud>> .env
)

REM ─── Create Launch Script ──────────────────────────────────
(
echo @echo off
echo cd /d "%~dp0"
echo start /B "" venv\Scripts\python.exe web_ui.py
echo cd editor
echo start /B "" npm run dev
echo cd ..
echo timeout /t 10 /nobreak ^>nul
echo start http://127.0.0.1:3000
echo echo Apeksha AI is running. Close this window to stop.
echo pause
) > launch.bat

REM ─── Create Desktop Shortcut ───────────────────────────────
set SCRIPT_PATH=%cd%\launch.bat
set ICON_PATH=%cd%\static\icon.png
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\Apeksha AI.lnk'); $s.TargetPath = '%SCRIPT_PATH%'; $s.WorkingDirectory = '%cd%'; $s.Description = 'Apeksha AI - AI Code Editor'; $s.Save()"

echo.
echo   ═══════════════════════════════════════════════
echo.
echo   ✅ Apeksha AI installed!
echo.
echo   NEXT: Add your free AI key:
echo     1. Go to https://console.groq.com (sign up free)
echo     2. Create API key
echo     3. Open .env file and paste your key
echo.
echo   Then double-click "Apeksha AI" on your Desktop.
echo.
echo   ═══════════════════════════════════════════════
echo.
pause
