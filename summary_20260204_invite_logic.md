# Invite Flow Logic Update Summary

## Context
User reported issues with TikTok authorization link on Safari (no response) and requested to simplify the redirect logic in `InviteFlow.tsx` by learning from `tk-wrapped-frontend` (specifically distinguishing between PC and Mobile handling) without adopting the full complexity of the reference implementation.

## Analysis
- **Reference Project (`tk-wrapped-frontend`)**:
  - **Mobile**: Uses `window.location.href = redirectUrl` (direct navigation). This bypasses popup blockers effectively on mobile browsers.
  - **PC**: Uses a QR Code modal for users to scan with their phone.
  - **Flow**: Waits for the redirect URL to be ready *before* user interaction (or handles it via polling).

- **Current Implementation (`InviteFlow.tsx`)**:
  - Used `window.open` for all devices.
  - On Mobile Safari, async `window.open` (triggered after API call) is often blocked.

## Changes Applied
Modified `app/invite/InviteFlow.tsx` to implement device-specific redirect logic:

1.  **Mobile Detection**: Added `isMobileDevice` helper function.
2.  **Mobile Handling**:
    - Uses `window.location.href` directly once the redirect URL is ready.
    - Skips the pre-opened window logic to avoid "empty window" or popup blocker issues.
3.  **PC Handling**:
    - Retains the "Pre-opened Window" pattern (`window.open("", "_blank")` called synchronously on click).
    - Once the URL is ready (via polling), the pre-opened window is redirected to the TikTok auth URL.
    - This provides a smooth experience on PC without navigating the user away from the main page.

## Result
- **Mobile Safari**: Should now redirect correctly without being blocked.
- **PC**: Maintains a working popup flow.
- **Complexity**: Kept low (no QR code, no complex state machine refactoring).
