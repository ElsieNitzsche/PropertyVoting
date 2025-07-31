# Browser Cache Clear Guide

**Issue**: Seeing old errors after code updates
**Cause**: Browser cached old JavaScript file
**Solution**: Clear cache and reload

---

## 🔄 Quick Fix Methods

### Method 1: Hard Reload (Fastest)
**Windows/Linux**:
- Chrome/Edge: `Ctrl + F5` or `Ctrl + Shift + R`
- Firefox: `Ctrl + F5` or `Ctrl + Shift + R`

**Mac**:
- Chrome/Edge: `Cmd + Shift + R`
- Firefox: `Cmd + Shift + R`
- Safari: `Cmd + Option + R`

---

### Method 2: Clear Cache via DevTools

1. **Open DevTools**:
   - Windows/Linux: `F12` or `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

2. **Right-click on Reload button** (next to address bar)

3. **Select**: "Empty Cache and Hard Reload"

---

### Method 3: Clear Browser Cache (Most Thorough)

#### Chrome/Edge
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Time range: "Last hour" (or "All time")
4. Click "Clear data"

#### Firefox
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cache"
3. Time range: "Last hour"
4. Click "Clear Now"

#### Safari
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Remove localhost data
4. Or: Develop → Empty Caches (`Cmd + Option + E`)

---

## ✅ Verification

After clearing cache:
1. Open http://127.0.0.1:1251
2. Open DevTools Console (`F12`)
3. Check Network tab for `main.js?v=2` (new version)
4. Try creating a proposal
5. Should see user-friendly error message (not old error)

---

## 🎯 What Should Happen Now

### Before Cache Clear ❌
```
Error: execution reverted: Previous proposal still active
(Line 1027 - old code)
```

### After Cache Clear ✅
```
Toast notification:
"Cannot create proposal: A previous proposal is still active.
Please wait for it to end before creating a new one."
```

---

## 🔧 Cache-Busting Applied

**File**: `public/index.html`
```html
<!-- Old -->
<script type="module" crossorigin src="./main.js"></script>

<!-- New (cache-busted) -->
<script type="module" crossorigin src="./main.js?v=2"></script>
```

The `?v=2` parameter forces browsers to load the new version.

---

## 📋 Fixed Issues

1. ✅ **BigNumber time calculation** - Now converts to Number first
2. ✅ **Proposal active check** - Checks `isVotingActive()` before creating
3. ✅ **User-friendly errors** - Clear messages instead of technical errors
4. ✅ **Vote button IDs** - Properly converts BigNumber to string
5. ✅ **Result display** - All BigNumber values use `.toString()`

---

## 🚀 Next Steps

1. **Clear your browser cache** using one of the methods above
2. **Reload the page** at http://127.0.0.1:1251
3. **Test the fixes**:
   - Connect wallet
   - Try creating a proposal (should show friendly error if one exists)
   - Check time remaining displays correctly
   - Verify vote buttons work

---

## 💡 Pro Tips

**Disable Cache During Development**:
1. Open DevTools (`F12`)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while testing

**Clear Service Workers** (if applicable):
1. DevTools → Application tab
2. Service Workers → Unregister
3. Clear Storage → Clear site data

---

## ✅ Success Indicators

After clearing cache, you should see:
- ✅ No `toNumber` errors in console
- ✅ Time remaining displays (e.g., "23h 45m")
- ✅ Vote buttons with correct proposal IDs
- ✅ Friendly error messages
- ✅ Network tab shows `main.js?v=2`

---

**Last Updated**: October 19, 2025
**Status**: All fixes applied, cache clear required
