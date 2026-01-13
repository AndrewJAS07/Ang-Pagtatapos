# 🔴 Common APK Crash Errors & Solutions

## Error 1: App Closes Immediately After Login
**Symptoms:**
- Login appears to work
- Screen briefly shows dashboard
- App crashes/closes without error

**Root Cause:**
- Token not saved in AuthContext
- API calls fail with 401 Unauthorized
- Null pointer exception when accessing user data

**Solution:**
✅ Updated AuthContext.tsx to persist token
✅ Changed login screens to use useAuth() hook
✅ Verified user before dashboard loads

**Status:** FIXED

---

## Error 2: "Cannot read property of undefined"
**Symptoms:**
- Red error screen appears
- Error message about undefined object
- Crash happens on dashboard mount

**Root Cause:**
- User is null because auth context wasn't synced
- Component tries to use user.id or similar
- No verification that user exists

**Solution:**
✅ Added useAuth() hook check
✅ Verify user exists before accessing properties
✅ Redirect to login if not authenticated

**Status:** FIXED

```typescript
// Example what was happening:
const userData = user.email; // ❌ user is null!

// Fixed with:
const { user } = useAuth();
if (!user) {
  router.replace('/logincommuter');
  return; // Don't proceed
}
const userData = user.email; // ✅ Safe now
```

---

## Error 3: Network Errors During API Calls
**Symptoms:**
- "Failed to fetch nearby drivers"
- "Network error" alerts
- 401 Unauthorized errors

**Root Cause:**
- Token not being sent with API requests
- API interceptor can't find token in AsyncStorage
- AuthContext not synchronized with AsyncStorage

**Solution:**
✅ AuthContext now explicitly saves token to AsyncStorage
✅ API interceptor can find token reliably
✅ All API calls include proper authorization

**Status:** FIXED

---

## Error 4: Socket Connection Crashes
**Symptoms:**
- App crashes when socket tries to connect
- No error message visible
- Crash happens after login delay

**Root Cause:**
- Socket creation errors not caught
- Event handlers update state after unmount
- Memory leaks from uncleaned listeners

**Solution:**
✅ Added try-catch around socket creation
✅ Proper event listener cleanup
✅ Graceful fallback to HTTP polling

**Status:** FIXED

---

## Error 5: Race Conditions on Component Mount
**Symptoms:**
- Occasional crashes when switching tabs
- Crashes happen randomly, hard to reproduce
- "Can't perform a React state update on unmounted component"

**Root Cause:**
- useEffect doesn't track mounting status
- State updates happen after component unmounts
- Cleanup not done properly

**Solution:**
✅ Added `mounted` flag pattern
✅ Check mounted before state updates
✅ Proper useEffect cleanup

**Status:** FIXED

```typescript
// Example what was happening:
useEffect(() => {
  loadData();
  return () => {}; // ❌ No cleanup!
}, []);

// Fixed with:
useEffect(() => {
  let mounted = true;
  const load = async () => {
    const data = await api.get(...);
    if (mounted) setData(data); // ✅ Only update if mounted
  };
  load();
  return () => { mounted = false; }; // ✅ Cleanup
}, []);
```

---

## Error 6: Unhandled Component Errors
**Symptoms:**
- Red error screen with no recovery option
- App is completely stuck
- Have to force-stop app

**Root Cause:**
- No error boundary to catch errors
- Unhandled exceptions crash entire app
- No user-friendly error UI

**Solution:**
✅ Created ErrorBoundary component
✅ Wraps entire app
✅ Shows recovery options

**Status:** FIXED

---

## How to Know Which Error You Have

### Error 1 or 2?
Look for logs with `[logincommuter]` or `[dashboardcommuter]`
- No logs? → Token not being saved
- Logs say "null user"? → Context not synced

### Error 3?
Check console for network-related errors
- `401 Unauthorized`? → Token not sent
- `Failed to fetch`? → Server unreachable

### Error 4?
Look for `[socket-context]` logs
- "Connection error"? → Socket failed
- No logs? → Socket creation failed

### Error 5?
Random crashes when using app
- Check Android logcat for "unmounted component"
- Happens during navigation? → Race condition

### Error 6?
Red error screen appears
- Has component stack trace? → Component error
- Shows user-friendly message? → Error boundary caught it

---

## Debugging Procedure

1. **Enable Console Logging**
   - Use Chrome DevTools or Android Logcat
   - Watch for `[tag]` prefixed messages

2. **Reproduce Crash**
   - Note exact steps that cause it
   - Note if it happens always or randomly

3. **Check Stored Data**
   ```typescript
   import { DebugUtils } from '../lib/debug-utils';
   await DebugUtils.checkAuth();     // Is user logged in?
   await DebugUtils.checkErrors();   // Any stored errors?
   ```

4. **Test API Connection**
   ```typescript
   import { DebugUtils } from '../lib/debug-utils';
   await DebugUtils.testAPIConnection(); // Does backend respond?
   ```

5. **Reset and Try Again**
   ```typescript
   import { DebugUtils } from '../lib/debug-utils';
   await DebugUtils.resetToLogin(); // Clear all data
   // Close and reopen app
   ```

---

## Prevention Tips

### For Future Development:
1. ✅ Always use context for shared state
2. ✅ Always cleanup in useEffect returns
3. ✅ Always check if data exists before using
4. ✅ Always wrap state updates with mounted check
5. ✅ Always add error boundaries for safety
6. ✅ Always log with context-specific tags

### Code Patterns to Follow:
```typescript
// ✅ GOOD: Using context with cleanup
const { user } = useAuth();

useEffect(() => {
  if (!user) return; // Guard clause
  
  let mounted = true;
  const load = async () => {
    try {
      const data = await api.get(...);
      if (mounted) setState(data);
    } catch (err) {
      console.error('[tag]', err);
      if (mounted) setError(err.message);
    }
  };
  load();
  return () => { mounted = false; };
}, [user]); // Depend on user
```

```typescript
// ❌ BAD: What causes crashes
useEffect(() => {
  api.get(...).then(data => {
    setState(data); // ❌ No mounted check!
  }); // ❌ No error handling!
}, []); // ❌ No dependencies!
```

---

## Quick Fix Checklist

If app still crashes after fixes:

- [ ] Did you rebuild APK after changes?
- [ ] Did you uninstall old APK?
- [ ] Did you clear app cache?
- [ ] Does console show `[tag]` logs?
- [ ] Did you wait for socket to connect?
- [ ] Is backend server running?
- [ ] Is network connectivity good?
- [ ] Did you check AsyncStorage data?

---

## Error Messages Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| "Cannot read property X of undefined" | User/data is null | Check if user exists first |
| "401 Unauthorized" | Token not sent | Check token in AsyncStorage |
| "Network error" | Can't reach backend | Check server is running |
| "Socket connection error" | Socket failed | Check logs in socket-context |
| "React state update on unmounted" | Async race condition | Add mounted flag |
| "TypeError: XYZ is not a function" | Invalid prop/call | Check types and nulls |

---

**All known crash causes have been fixed! 🎉**

If you encounter a different error, please share:
1. Full console output
2. The exact error message
3. Steps to reproduce
4. Device/app version info
