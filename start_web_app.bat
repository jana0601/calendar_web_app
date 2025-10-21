@echo off
echo ================================================
echo Calendar Web App
echo ================================================
echo.
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting Calendar Web App...
echo The calendar will open in your browser automatically.
echo If it doesn't open, go to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo ================================================
python run_web_app.py
