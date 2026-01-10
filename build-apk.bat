@echo off
echo Starting EAS Build for Android APK...
echo.
echo Make sure you're logged in first (run: npx eas-cli login)
echo.
pause
npx eas-cli build --platform android --profile production
pause

