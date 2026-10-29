@echo off
title GoKerala: Gesture Run - AAB (App Bundle) Builder
echo ========================================================
echo   🌴 GOKERALAM: GESTURE RUN - ANDROID AAB BUILDER
echo   (For Google Play Store submission)
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
echo [3/4] Compiling Android Release App Bundle (.aab) with Gradle...
cd android
call gradlew.bat bundleRelease
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gradle AAB bundle failed!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [4/4] Copying AAB to root directory...
if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    copy /Y "android\app\build\outputs\bundle\release\app-release.aab" "GoKeralam.aab"
)

echo.
echo ========================================================
echo   SUCCESS! AAB bundle created:
echo   - Root folder: GoKeralam.aab
echo   - Output folder: android\app\build\outputs\bundle\release\app-release.aab
echo ========================================================
echo.
pause
