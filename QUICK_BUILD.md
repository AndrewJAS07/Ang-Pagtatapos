# Quick APK Build Instructions

## 🚀 Fastest Way: EAS Cloud Build

### Step 1: Login to Expo
```bash
npx eas-cli login
```
(You'll need to create an account at https://expo.dev if you don't have one)

### Step 2: Build APK
```bash
npx eas-cli build --platform android --profile production
```

### Step 3: Wait & Download
- Build takes ~15-20 minutes
- You'll get a download link when done
- Download the APK and share it!

---

## 🏠 Alternative: Local Build (If you have Android Studio)

### Windows PowerShell:
```powershell
cd android
.\gradlew.bat assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📝 Current Setup
✅ EAS configuration ready  
✅ APK build type configured  
✅ App package: com.anonymous.eyytrike  
✅ Version: 1.0.0  

**Ready to build!** Just login and run the build command.

