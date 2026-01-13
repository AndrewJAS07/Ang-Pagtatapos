# APK Crash After Login - Debugging Guide

## Issues Fixed

I've identified and fixed **multiple critical issues** that were causing the app to crash after login:

### 1. **Token Persistence in Context** ✅ FIXED
**Problem:** After login, the token was stored in AsyncStorage but the `AuthContext` wasn't updating, causing API requests to fail with 401 errors.

**Solution:** Updated `AuthContext.tsx` to ensure tokens and user data are properly persisted when login/register occurs.

**File:** `lib/AuthContext.tsx`

### 2. **Login Screen Not Using Context** ✅ FIXED  
**Problem:** `logincommuter.tsx` was calling `authAPI.login()` directly instead of using `useAuth()` hook, bypassing context updates.

**Solution:** Refactored to use `useAuth()` hook and added proper error handling.

**File:** `app/logincommuter.tsx`

### 3. **Race Conditions in Dashboard** ✅ FIXED
**Problem:** Dashboard tried to fetch nearby drivers immediately without ensuring authentication was complete. Socket errors could crash the app.

**Solution:** 
- Added `useAuth()` hook to verify user is authenticated
- Added better error handling in API calls
- Wrapped effects with `mounted` flag to prevent state updates after unmount
- Added try-catch blocks around socket event handlers

**File:** `app/(commuter)/dashboardcommuter.tsx`

### 4. **Socket Context Issues** ✅ FIXED
**Problem:** Socket initialization errors weren't caught, causing app crashes. Missing event handler cleanup.

**Solution:**
- Wrapped socket creation in better try-catch
- Added proper event listener cleanup
- Added logging to help debug connection issues
- Socket now gracefully falls back to HTTP polling on failure

**File:** `lib/socket-context.tsx`

### 5. **No Global Error Boundary** ✅ FIXED
**Problem:** Unhandled errors in React components would cause app crashes without proper error display.

**Solution:** Created comprehensive `ErrorBoundary` component that catches and displays errors.

**File:** `components/ErrorBoundary.tsx`

---

## How to Debug Further

### Step 1: Check the Error Logs
When the app crashes, check AsyncStorage for error data:

```typescript
// In your dashboard or a debug screen:
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkErrors = async () => {
  const jsError = await AsyncStorage.getItem('last_js_error');
  const boundaryError = await AsyncStorage.getItem('last_boundary_error');
  console.log('JS Error:', jsError);
  console.log('Boundary Error:', boundaryError);
};
```

### Step 2: Enable Verbose Logging
All my fixes include detailed console logs with `[tag]` prefixes:
- `[logincommuter]` - Login flow
- `[dashboardcommuter]` - Dashboard issues
- `[socket-context]` - Socket connection issues

Look for these logs in your device/emulator console.

### Step 3: Common Crash Causes

1. **"Cannot read property of undefined"**
   - Check if `user` is null
   - Verify token is in AsyncStorage
   - Fixed: Added auth check in dashboard

2. **Network/401 errors on API calls**
   - Token not being sent with requests
   - Fixed: AuthContext now properly manages tokens

3. **Socket connection failures**
   - Falls back to HTTP polling
   - Fixed: Better error handling and logging

4. **Component mount/unmount race conditions**
   - Fixed: Added `mounted` flag in useEffect cleanup

---

## Testing Checklist

1. **After building new APK:**
   - [ ] Clear app cache: `Settings → Apps → [YourApp] → Storage → Clear Cache`
   - [ ] Uninstall previous APK
   - [ ] Install new APK fresh

2. **Test login flow:**
   - [ ] Enter valid credentials
   - [ ] Check console for `[logincommuter]` logs
   - [ ] Verify user is stored in AsyncStorage
   - [ ] Check for any errors before navigation

3. **Test dashboard:**
   - [ ] Wait for map to load
   - [ ] Check for `[dashboardcommuter]` logs
   - [ ] Verify drivers are loading
   - [ ] Test socket connection (check `[socket-context]` logs)

4. **If crash occurs:**
   - [ ] Check `last_js_error` and `last_boundary_error` in AsyncStorage
   - [ ] Share console logs with tag prefixes
   - [ ] Note exact time crash occurs

---

## Key Changes Summary

| File | Changes |
|------|---------|
| `lib/AuthContext.tsx` | Added token/user persistence in login/register |
| `app/logincommuter.tsx` | Now uses `useAuth()` hook instead of direct API calls |
| `app/(commuter)/dashboardcommuter.tsx` | Added auth verification, better error handling, proper cleanup |
| `lib/socket-context.tsx` | Improved error handling and event cleanup |
| `app/_layout.tsx` | Wrapped with ErrorBoundary |
| `components/ErrorBoundary.tsx` | NEW: Catches unhandled errors |

---

## Next Steps

1. **Rebuild APK** with these fixes
2. **Test the login flow** carefully
3. **Watch console logs** for any error messages
4. **Share any errors** that still occur with the `[tag]` prefix logs

If the app still crashes, please share:
- The exact error message
- Console logs with `[tag]` prefixes
- Steps to reproduce
- Whether it crashes immediately after login or after some actions

