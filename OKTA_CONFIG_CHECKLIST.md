# Okta Configuration Checklist

## Quick Reference for Okta Admin Console Setup

### Location
- URL: https://trial-8272716.okta.com/admin
- Navigate to: **Applications** → Your Application → **General** tab → **Edit**

---

## Configuration Checklist

### ☐ Grant Types
- [x] **Authorization Code** - ENABLE
- [x] **Refresh Token** - ENABLE (optional)
- [ ] **Implicit (Hybrid)** - DISABLE (critical!)
- [ ] **Client Credentials** - Not needed for this app

### ☐ Sign-in Redirect URIs
Add these URIs (order doesn't matter):
- `http://localhost:5173/callback` ← **Required for OAuth callback**
- `http://localhost:5173` ← Optional (can keep or remove)

### ☐ Sign-out Redirect URIs
Add this URI:
- `http://localhost:5173`

### ☐ Other Settings
- **Login initiated by:** App Only (or Either Okta or App)
- **Initiate login URI:** Can be left blank
- **Federation Broker Mode:** Leave disabled

---

## Quick Verification

After saving, verify your settings match:

```
Grant type allowed:
  ✅ Authorization Code
  ✅ Refresh Token
  ❌ Implicit (Hybrid)  ← Make sure this is DISABLED!

Sign-in redirect URIs:
  ✅ http://localhost:5173/callback

Sign-out redirect URIs:
  ✅ http://localhost:5173
```

---

## Why These Changes?

### Disabling Implicit Flow
The Implicit flow uses iframes which are blocked by:
- Content Security Policy (CSP)
- Third-party cookie restrictions
- Modern browser security features

### Enabling Authorization Code + PKCE
This modern flow uses:
- Full-page redirects (no iframes)
- Authorization codes (not tokens in URL)
- PKCE for security without client secrets
- Works with all browser security features

---

## Testing After Configuration

1. Save changes in Okta Admin Console
2. Run `npm run dev` in the frontend directory
3. Open http://localhost:5173
4. Click "User Login Experience" tab
5. Enter credentials and complete MFA
6. Watch for full-page redirect to Okta and back
7. Success screen should display without errors

---

## Common Mistakes

❌ **Forgot to disable Implicit flow**
   → Widget will still try to use iframes
   → CSP errors will continue

❌ **Wrong redirect URI**
   → Must be exactly `http://localhost:5173/callback`
   → Check for typos, trailing slashes, http vs https

❌ **Authorization Code not enabled**
   → Will get "invalid grant type" error
   → Enable in Grant Types section

---

## Production Deployment

When deploying to production, remember to:

1. Add production redirect URIs:
   - `https://yourdomain.com/callback`
   - `https://yourdomain.com`

2. Update environment variables:
   - `VITE_OKTA_ORG_URL` → Your production Okta org
   - `VITE_OKTA_CLIENT_ID` → Your production app client ID

3. Consider using:
   - Custom Okta domain for branding
   - Refresh tokens for longer sessions
   - Token renewal/refresh logic

---

## Need Help?

If configuration doesn't seem to save:
1. Check you have admin permissions
2. Try refreshing the page and re-editing
3. Verify you're editing the correct application
4. Check for validation errors when saving

If authentication still fails after configuration:
1. Clear browser cache and cookies
2. Open DevTools console for error messages
3. Check Network tab for authorize/token requests
4. Verify environment variables match Okta settings
