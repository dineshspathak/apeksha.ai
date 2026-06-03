@echo off
REM ═══════════════════════════════════════════════════════════════
REM Apeksha AI — Build Windows Installer (.exe)
REM Creates a self-extracting installer for Windows distribution
REM Requires: 7-Zip or WinRAR installed
REM ═══════════════════════════════════════════════════════════════

echo.
echo   Building Apeksha AI Windows Installer...
echo.

REM Create distribution folder
set DIST_DIR=%TEMP%\apeksha-dist
rmdir /s /q "%DIST_DIR%" 2>nul
mkdir "%DIST_DIR%"

REM Copy required files
xcopy /E /I /Q agent.py "%DIST_DIR%\"
xcopy /E /I /Q config.py "%DIST_DIR%\"
xcopy /E /I /Q tools.py "%DIST_DIR%\"
xcopy /E /I /Q memory.py "%DIST_DIR%\"
xcopy /E /I /Q knowledge.py "%DIST_DIR%\"
xcopy /E /I /Q web_ui.py "%DIST_DIR%\"
xcopy /E /I /Q cloud_llm.py "%DIST_DIR%\"
xcopy /E /I /Q models.py "%DIST_DIR%\"
xcopy /E /I /Q media_tools.py "%DIST_DIR%\"
xcopy /E /I /Q auth.py "%DIST_DIR%\"
xcopy /E /I /Q billing.py "%DIST_DIR%\"
xcopy /E /I /Q file_manager.py "%DIST_DIR%\"
xcopy /E /I /Q updater.py "%DIST_DIR%\"
xcopy /E /I /Q main.py "%DIST_DIR%\"
xcopy /E /I /Q requirements.txt "%DIST_DIR%\"
copy install-windows.bat "%DIST_DIR%\"
copy uninstall-windows.bat "%DIST_DIR%\"
copy .env.example "%DIST_DIR%\.env"
xcopy /E /I /Q static "%DIST_DIR%\static\"
xcopy /E /I /Q editor "%DIST_DIR%\editor\" /EXCLUDE:exclude.txt
mkdir "%DIST_DIR%\workspace"
mkdir "%DIST_DIR%\knowledge"

REM Create ZIP
powershell -Command "Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%USERPROFILE%\Desktop\Apeksha-AI-Windows.zip' -Force"

echo.
echo   ✅ Windows package created: %USERPROFILE%\Desktop\Apeksha-AI-Windows.zip
echo.
pause
