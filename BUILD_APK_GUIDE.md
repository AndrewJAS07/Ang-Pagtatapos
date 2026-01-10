# APK Build Guide for EyyTrike

This guide will help you build a production APK file that can be downloaded and shared.

## Prerequisites

1. **Expo Account** (for cloud builds) - Sign up at https://expo.dev
2. **EAS CLI** - Already installed ✅
3. **Android Studio** (for local builds only) - Optional

## Method 1: EAS Build (Cloud Build - Recommended) ⭐

This is the easiest method. EAS will build your APK in the cloud.

### Step 1: Login to Expo
```bash
npx eas-cli login
```

### Step 2: Build Production APK
```bash
npx eas-cli build --platform android --profile production
```

This will:
- Build your app in the cloud
- Generate an APK file
- Provide a download link when complete

### Step 3: Download the APK
- After the build completes, you'll get a download link
- Download the APK file
- Share it with others or install on Android devices

**Build time:** ~15-20 minutes  
**Cost:** Free tier available

---

## Method 2: Local Build (Faster, but requires setup)

If you have Android Studio installed, you can build locally.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build APK Locally
```bash
cd android
./gradlew assembleRelease
```

On Windows (PowerShell):
```powershell
cd android
.\gradlew.bat assembleRelease
```

### Step 3: Find Your APK
The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Build time:** ~5-10 minutes (first time may take longer)  
**Requirements:** Android Studio with Android SDK

---

## Method 3: Using Expo CLI (Alternative Local Build)

```bash
npx expo run:android --variant release
```

This will build and can generate an APK, but you may need to locate it in the build folder.

---

## Important Notes

### For Production/Sharing:
1. **Signing Key**: The current build uses a debug keystore. For production apps you plan to distribute:
   - Generate a production keystore
   - Configure it in `android/app/build.gradle`
   - Keep the keystore file safe (you'll need it for updates)

2. **App Configuration**: 
   - Check `app.json` for app name, version, and package name
   - Update Google Maps API key if needed
   - Update server URLs if deploying to production

3. **Version Updates**:
   - Update `versionCode` in `android/app/build.gradle` for each new release
   - Update `version` in `app.json` and `package.json`

---

## Quick Start (EAS Build)

```bash
# 1. Login (if not already)
npx eas-cli login

# 2. Build APK
npx eas-cli build --platform android --profile production

# 3. Wait for build to complete and download APK
```

---

## Troubleshooting

### EAS Build Issues
- Make sure you're logged in: `npx eas-cli whoami`
- Check your internet connection
- Verify `eas.json` configuration

### Local Build Issues
- Ensure Android Studio is installed
- Check that Android SDK is properly configured
- Try: `cd android && ./gradlew clean` then rebuild

### APK Installation Issues
- Enable "Install from Unknown Sources" on Android device
- Make sure the APK is for the correct architecture (ARM, x86, etc.)
- Check that minimum Android version is supported

---

## Next Steps After Building

1. **Test the APK** on a real device before sharing
2. **Update version numbers** for future releases
3. **Consider Google Play Store** for wider distribution
4. **Set up proper signing** for production releases

---

## Current Configuration

- **App Name**: EyyTrike
- **Package**: com.anonymous.eyytrike
- **Version**: 1.0.0
- **Build Type**: APK (configured in eas.json)

