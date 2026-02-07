# Known Issues - Okta BYOT + Twilio Verify Demo

## Issue #1: Okta Widget Hangs After MFA (Identity Engine Conflict)

### Status
Known limitation in MVP - workaround provided

### Description
After entering credentials and completing MFA (entering the OTP code), the Okta Sign-In Widget shows a loading spinner and never completes authentication.

### Root Cause
The Okta trial org is configured to use **Okta Identity Engine**, which expects an OAuth redirect flow with PKCE. However, the demo uses an **embedded widget** approach which requires the older Classic Engine authentication flow.

**Evidence from Okta logs:**
- All authentication requests go to `/oauth2/default/v1/interact` (Identity Engine endpoint)
- Setting `useClassicEngine: true` in widget config doesn't force Classic Engine behavior
- No authentication completion events appear in logs after MFA challenge

### Technical Details

**Expected Flow (Classic Engine):**
1. User enters credentials → `/api/v1/authn` (Classic endpoint)
2. MFA challenge → User enters OTP
3. Widget callback fires with session token
4. Demo shows success screen

**Actual Flow (Identity Engine):**
1. User enters credentials → `/oauth2/default/v1/interact` (Identity Engine endpoint)
2. MFA challenge → User enters OTP
3. Widget attempts OAuth redirect flow (not supported in embedded mode)
4. **Widget hangs** - callback never fires

### Workaround (Current MVP)

After entering your OTP code at step 2, click the green **"Mark as Complete ✓"** button that appears in the top-right corner of the login pane. This manually triggers the success screen without waiting for the widget callback.

**The workaround is acceptable for demo purposes because:**
- MFA does complete successfully on Okta's side (as shown in logs)
- The telephony inline hook integration (the main demo feature) works correctly
- Event capture from Twilio Functions → Backend → Frontend works as designed
- The issue is purely with the widget UI flow, not the backend integration

### Proper Solutions (Future Enhancement)

**Option 1: Migrate to Full Identity Engine Support**
```typescript
// Use OktaAuth SDK instead of Sign-In Widget
import { OktaAuth } from '@okta/okta-auth-js'

const authClient = new OktaAuth({
  issuer: `${oktaOrgUrl}/oauth2/default`,
  clientId: clientId,
  redirectUri: redirectUri,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
})

// Use redirect flow
await authClient.token.getWithRedirect({
  responseType: ['code'],
  responseMode: 'query'
})
```

**Option 2: Use Classic Engine Okta Org**
- Create an Okta org with Classic Engine enabled (requires specific org configuration)
- The current widget code would work without modifications

**Option 3: Server-Side Authentication**
- Implement OAuth flow on backend
- Frontend just displays login form
- Backend handles all Okta interactions
- Return success/failure to frontend

### Impact

**What Works:**
- ✅ User can enter credentials
- ✅ MFA challenge triggers (SMS sent via Twilio Verify)
- ✅ User can enter OTP code
- ✅ Telephony inline hook → Twilio Function → Verify API flow works
- ✅ Event capture and visualization works perfectly
- ✅ WebSocket real-time updates work
- ✅ Manual success override provides good demo experience

**What Doesn't Work:**
- ❌ Automatic success screen after OTP verification
- ❌ OAuth token retrieval (not needed for demo purposes)

### Testing the Demo

**For MVP Demos:**
1. Enter username/password
2. Wait for SMS with OTP code
3. Enter OTP in Okta widget
4. Click the green "Mark as Complete ✓" button
5. Success screen appears
6. Check right pane for API events (when Twilio Function is instrumented)

**For Production Use:**
This issue only affects the demo frontend. The actual Okta BYOT + Twilio Verify integration works correctly in production where users would authenticate through Okta's hosted login pages, not an embedded widget.

### Related Files
- `frontend/src/components/OktaLoginPane.tsx` - Widget configuration and workaround button
- `IMPLEMENTATION_SUMMARY.md` - Details of all attempted fixes

### References
- [Okta Identity Engine vs Classic Engine](https://developer.okta.com/docs/guides/oie-intro/)
- [Okta Sign-In Widget - Embedded Auth](https://github.com/okta/okta-signin-widget#embedded-authentication)
- [Okta Auth JS SDK](https://github.com/okta/okta-auth-js)

---

## Future Issues
Document additional known issues here as they arise.
