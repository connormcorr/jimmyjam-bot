@echo off
echo Checking for Node.js modules...
if not exist "node_modules" (
    echo node_modules directory not found. Running npm install...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies with npm. Please check for errors.
        pause
        exit /b 1
    )
)

echo Starting the Discord bot (Node.js)...
node bot.js
if errorlevel 1 (
    echo Bot script (bot.js) failed to start or encountered an error.
    pause
    exit /b 1
)

echo Bot has stopped.
pause
