@echo off
echo ========================================================
echo   Starting Duolingo Clone (FastAPI Backend + Next.js Frontend)
echo ========================================================

start "Duolingo Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "Duolingo Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Application running!
echo Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Frontend: http://localhost:3000
echo ========================================================
pause
