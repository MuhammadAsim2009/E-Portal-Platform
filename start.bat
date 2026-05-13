@echo off
title E-Portal System

echo ================================
echo     Starting E-Portal System
echo ================================
echo.

:: Start Server
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Small delay
timeout /t 2 /nobreak >nul

:: Start Client
echo [2/2] Starting Frontend Client...
start "Frontend Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ================================
echo   Both servers are starting...
echo   Check the opened terminals!
echo ================================
echo.
pause
