# Invite Flow Resume Logic Update

## Context
Since the app uses `window.location.href` to redirect users to TikTok, the page unmounts and all state is lost. User requested to persist the `job_id` and resume polling upon application initialization (when the user returns from TikTok).

## Changes Applied
Modified `app/invite/InviteFlow.tsx`:

1.  **LocalStorage Persistence**:
    -   Defined `JOB_ID_KEY = "tiktok_job_id"`.
    -   In `handleConnect`, immediately save the `jobId` to `localStorage` before polling starts.
    -   In `resetState` and on successful completion, `localStorage.removeItem(JOB_ID_KEY)` is called to clean up.

2.  **Resume Flow (`useEffect`)**:
    -   Added a `useEffect` that runs on mount.
    -   Checks for `localStorage.getItem(JOB_ID_KEY)`.
    -   If found:
        -   Sets `step` to 2 (Connect Step) and `isConnecting` to true to show the loading UI.
        -   Calls `startPolling(savedJobId, false)` to resume checking status.
        -   Passes `allowRedirect: false` to prevent an infinite redirect loop if the user just reloaded the page without completing auth.

3.  **Refactored Polling Logic**:
    -   Extracted polling logic into `startPolling(jobId, allowRedirect)`.
    -   `allowRedirect`: Controls whether the app should trigger `window.location.href` when status is "ready".
        -   `true` for fresh "Connect" clicks.
        -   `false` for resumed sessions (prevents loops).
    -   On `status === "completed"`:
        -   Clears interval.
        -   Clears localStorage.
        -   Sets tokens.
        -   Auto-advances to Step 3 (Success/Loading animation).

## Result
-   **User Experience**: Users returning from TikTok (or reloading) will see the app checking their status instead of resetting to the landing page.
-   **Robustness**: Handles page reloads and back navigation gracefully without losing the session context.
