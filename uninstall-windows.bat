@echo off
REM ═══════════════════════════════════════════════════════════════
REM Apeksha AI — Windows Uninstaller
REM Run: uninstall-windows.bat
REM ═══════════════════════════════════════════════════════════════

echo.
echo   Apeksha AI — Uninstaller
echo   ━━━━━━━━━━━━━━━━━━━━━━━━
echo.

set /p confirm="  Are you sure you want to uninstall Apeksha AI? (y/n): "
if /i not "%confirm%"=="y" (
    echo   Cancelled.
    exit /b 0
)

echo.

REM Stop processes
echo   Stopping Apeksha services...
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq web_ui*" >nul 2>&1
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq next*" >nul 2>&1

REM Remove desktop shortcut
if exist "%USERPROFILE%\Desktop\Apeksha AI.lnk" (
    del "%USERPROFILE%\Desktop\Apeksha AI.lnk"
    echo   ✅ Desktop shortcut removed
)

REM Ask about data
set /p delete_data="  Delete memory & knowledge data too? (y/n): "
if /i "%delete_data%"=="y" (
    rmdir /s /q apeksha_memory 2>nul
    rmdir /s /q apeksha_data 2>nul
    rmdir /s /q venv 2>nul
    rmdir /s /q editor\node_modules 2>nul
    rmdir /s /q editor\.next 2>nul
    echo   ✅ Data deleted
)

REM Ask about Ollama
set /p remove_ollama="  Uninstall Ollama too? (y/n): "
if /i "%remove_ollama%"=="y" (
    winget uninstall Ollama.Ollama >nul 2>&1
    echo   ✅ Ollama uninstalled
)

echo.
echo   ✅ Apeksha AI has been uninstalled.
echo.
echo   To fully remove, delete this folder.
echo.
pause
