# Invite Flow Logic Update Summary (Simplified)

## Context
User requested to further simplify the redirect logic in `InviteFlow.tsx`, specifically asking to use `location.href` only, removing the complexity of pre-opened windows and device-specific handling.

## Changes Applied
Modified `app/invite/InviteFlow.tsx`:

1.  **Unified Redirect Logic**:
    - Removed `isMobileDevice` check.
    - Removed `window.open` (popup) logic completely.
    - All devices now use `window.location.href = redirectUrl` once the URL is ready.

2.  **Flow**:
    - User clicks "Connect".
    - `setIsConnecting(true)`.
    - API call `startTikTokLink()` to get Job ID.
    - Polling starts.
    - Once status is "ready" with a `redirect_url`:
        - Polling stops (`clearInterval`).
        - Current page redirects to TikTok auth URL (`window.location.href`).

## Result
- **Simplicity**: Code is much cleaner and easier to maintain.
- **Behavior**: User is navigated away from the app to TikTok on all devices.
- **Note**: Since the user leaves the page, the app state (like current step) will be reset upon return unless persisted (which was not part of this specific request but is a consequence of this design choice).
