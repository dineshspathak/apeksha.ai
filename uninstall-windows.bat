@echo off
REM ═══════════════════════════════════════════════════════════════
REM Apeksha AI — Uninstaller (Complete Removal)
REM Run: uninstall-windows.bat
REM ═══════════════════════════════════════════════════════════════

echo.
echo   Apeksha AI — Uninstaller
echo   ━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   This will completely remove Apeksha AI from your system.
echo.

set /p confirm="  Are you sure? (y/n): "
if /i not "%confirm%"=="y" (
    echo   Cancelled.
    exit /b 0
)

echo.
echo   Removing Apeksha AI...

REM Stop processes
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq web_ui*" >nul 2>&1
taskkill /F /IM "node.exe" >nul 2>&1
echo   ✅ Stopped services

REM Remove desktop shortcut
del "%USERPROFILE%\Desktop\Apeksha AI.lnk" 2>nul
echo   ✅ Removed shortcut

REM Remove all data
rmdir /s /q apeksha_memory 2>nul
rmdir /s /q apeksha_data 2>nul
rmdir /s /q venv 2>nul
rmdir /s /q editor\node_modules 2>nul
rmdir /s /q editor\.next 2>nul
echo   ✅ Deleted data

REM Uninstall Ollama
winget uninstall Ollama.Ollama >nul 2>&1
rmdir /s /q "%USERPROFILE%\.ollama" 2>nul
echo   ✅ Removed Ollama & AI models

echo.
echo   ✅ Apeksha AI completely uninstalled.
echo.

REM Delete the entire project folder
cd %USERPROFILE%
rmdir /s /q "%~dp0"
echo   ✅ Folder deleted. Goodbye!
pause
