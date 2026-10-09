@echo off
set "ROOT=%~dp0"
echo ========================================================
echo   Starting Duolingo Clone (FastAPI Backend + Next.js Frontend)
echo ========================================================

start "Duolingo Backend (FastAPI)" cmd /k "cd /d ""%ROOT%backend"" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "Duolingo Frontend (Next.js)" cmd /k "cd /d ""%ROOT%frontend"" && npm.cmd run dev"

echo.
echo Application running!
echo Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Frontend on this computer: http://localhost:3000
echo For a phone on the same Wi-Fi, use the computer's Wi-Fi IPv4 address on port 3000.
echo Example: http://192.168.1.25:3000
echo Ensure Windows Firewall allows Node.js and Python on private networks.
echo ========================================================
pause
