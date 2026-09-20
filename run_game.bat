@echo off
title GoKerala: Gesture Run - Launcher
echo ========================================================
echo   🌴 GOKERALA: GESTURE RUN (3D Game + Python MediaPipe)
echo ========================================================
echo.
echo Starting Python Precision MediaPipe Vision Engine (Port 8765)...
start cmd /k "python gesture_server.py"

echo.
echo Starting React Native Three.js Web Dev Server (Port 3000)...
start cmd /k "npm run dev"

echo.
echo Opening browser at http://localhost:3000/ ...
timeout /t 3 >nul
start http://localhost:3000/

echo.
echo Both engines are running!
echo Stand in front of your camera and move to explore Kerala!
