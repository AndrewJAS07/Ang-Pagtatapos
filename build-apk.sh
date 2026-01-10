#!/bin/bash
echo "Starting EAS Build for Android APK..."
echo ""
echo "Make sure you're logged in first (run: npx eas-cli login)"
echo ""
read -p "Press Enter to continue..."
npx eas-cli build --platform android --profile production

