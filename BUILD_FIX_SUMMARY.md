# EAS Build Fix - January 25, 2026

## Problem
The Android APK build was failing with:
```
Execution failed for task ':expo-dev-launcher:compileReleaseKotlin'.
> A failure occurred while executing org.jetbrains.kotlin.compilerRunner.GradleKotlinCompilerWorkAction
   > Compilation error. See log for more details
```

## Root Cause
The issue was caused by `expo-dev-client` dependency being installed for production builds. Here's why it's problematic:

1. **`expo-dev-client`** is designed for local development with Expo CLI (e.g., `expo start --dev-client`)
2. It includes `expo-dev-launcher`, which contains Kotlin code with compatibility issues with React Native 0.81.5
3. During EAS production builds, `expo-dev-launcher:compileReleaseKotlin` tries to compile and fails due to API mismatches
4. EAS Build doesn't need `expo-dev-client` since it handles the build process directly

## Solution Applied
✅ **Removed `expo-dev-client` from package.json dependencies**

### Changes Made:
1. Removed `"expo-dev-client": "^6.0.20"` from dependencies
2. Removed `"postinstall": "node scripts/apply-patches.js"` from scripts (no longer needed)
3. Removed `patch-package` and `postinstall-postinstall` from devDependencies

### Updated package.json:
- **Before**: Included expo-dev-client (6.0.20) - causes compilation errors
- **After**: Removed it - clean production build without dev tools

## Workflow Distinction
- **Local Development**: Use `expo start --dev-client` or `expo run:android` - doesn't need expo-dev-client in package.json since Expo CLI manages it
- **EAS Production Build**: No need for expo-dev-client - EAS Build handles everything
- **Expo Go**: For testing on device without custom native code

## Build Status
✅ Build submitted to EAS with fixes applied
Expected result: APK build should complete successfully

## Testing
To verify the fix works:
```bash
eas build -p android --profile production
```

If the build succeeds, the issue is resolved. The APK can then be tested on Android devices.
