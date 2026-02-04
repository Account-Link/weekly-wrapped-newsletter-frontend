# Invite Flow Geo Check & Resume Logic

## Context
User requested two main improvements to the Invite Flow:
1. **Resume Capability**: Since the TikTok auth flow involves a redirect (location.href), the page state is lost. We need to persist the `job_id` and resume polling when the user returns to the app.
2. **Geo Restriction**: After a successful TikTok connection, we need to verify if the user is in the US. If not, a specific prompt/modal should be shown.

## Changes

### 1. Resume Logic (`InviteFlow.tsx`)
- **Persistence**: Added `localStorage` usage to save `tiktok_auth_job_id` when starting the flow.
- **Initialization**: Added a `useEffect` on mount to check for an existing `job_id`.
- **Restoration**: If a `job_id` is found, the app automatically jumps to **Step 2** (Connect/Preparing) and restarts the polling process (`startPolling`).
- **Cleanup**: The `job_id` is removed from `localStorage` upon successful completion or expiration/error.

### 2. Geo Location Check
- **API Endpoint**: Created `app/api/geo/route.ts` using `@vercel/functions` to detect the user's country.
- **Frontend Logic**: Added `checkGeoLocation` function in `InviteFlow.tsx`.
- **Integration**:
  - The check is performed **only after** the TikTok polling returns a `completed` status.
  - **If US**: Proceed to Step 3 (Loading/Success).
  - **If Not US**: Show a "Region Not Supported" modal (`showGeoModal`).

### 3. UI Updates
- **Geo Modal**: Added a clean, centered modal using Framer Motion to inform non-US users that the service is currently US-only.
- **Refactoring**: Refactored `startAndPoll` and created a reusable `startPolling` function to support both fresh starts and resumed sessions.

## Files Modified
- `app/invite/InviteFlow.tsx`
- `app/api/geo/route.ts` (Created previously)
