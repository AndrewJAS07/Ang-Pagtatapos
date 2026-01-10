@echo off
echo ========================================
echo EAS Build for Android APK
echo ========================================
echo.
echo This will build your APK in the cloud.
echo Make sure you're logged in as: itsurjeffqt
echo.
echo Press any key to start the build...
pause
echo.
echo Starting build...
echo.

set EAS_NO_VCS=1
npx eas-cli build --platform android --profile production

echo.
echo ========================================
echo Build process completed!
echo Check the output above for the download link.
echo ========================================
pause

