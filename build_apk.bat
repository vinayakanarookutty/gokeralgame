@echo off
title GoKerala: Gesture Run - APK Builder
echo ========================================================
echo   🌴 GOKERALAM: GESTURE RUN - ANDROID APK BUILDER
echo ========================================================
echo.

echo [1/4] Building web production assets (Vite)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Syncing web assets and plugins with Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Compiling Android Debug APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gradle build failed!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [4/4] Copying APK to root directory...
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "GoKeralam.apk"

echo.
echo ========================================================
echo   SUCCESS! APK successfully built:
echo   - Root folder: GoKeralam.apk
echo   - Output folder: android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
echo.
pause
