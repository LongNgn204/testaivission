@echo off
:: ============================================================
:: 🚀 Vision Coach Backend Server - Quick Start Script
:: ============================================================
:: 
:: This script starts the backend server for Vision Coach
:: Make sure Node.js is installed and dependencies are ready
::

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║    🚀 Starting Vision Coach Backend Server...            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Display Node version
echo 📌 Node.js version:
node --version
echo.

:: Check if node_modules exists in backend
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    echo.
    call npm install
    echo.
)

:: Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  WARNING: .env.local file not found!
    echo Creating a default .env.local file...
    echo.
    (
        echo # Vision Coach Backend Configuration
        echo GEMINI_API_KEY=your-api-key-here
        echo JWT_SECRET=vision-coach-secret-key-change-in-production-2024
        echo PORT=3001
        echo CORS_ORIGIN=http://localhost:5173,http://localhost:3000
        echo VITE_API_URL=http://localhost:3001
    ) > .env.local
    echo ✓ Created .env.local file. Please update with your API keys.
    echo.
)

:: Start the server
echo 🚀 Starting server on port 3001...
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
