# Geo Check Logic Update: Dual Verification

## Context
User pointed out that the reference project (`tk-wrapped-frontend`) uses a dual-check mechanism for US location verification, involving both **Device Timezone** and **IP Geolocation**.

## Changes

### 1. New Utility: `src/lib/timezone.ts`
- Ported from `tk-wrapped-frontend`.
- `getUserTimezone()`: Returns the browser's IANA timezone string (e.g., "America/New_York").
- `isUSTimezone(timezone)`: Checks if the timezone string starts with "America/", "US/", or is "Pacific/Honolulu".

### 2. Updated Logic: `InviteFlow.tsx`
- Modified `checkGeoLocation` function to implement the dual check.
- **Logic**:
  1.  **Timezone Check**: Get browser timezone and validate against US patterns.
  2.  **IP Check**: Call `/api/geo` (which uses Vercel geolocation).
  3.  **Result**: `isInUS = timezoneIsUS || geoIsUS` (Logical OR).
  4.  **Fail Open**: If checks fail or error out, default to `true` (allow access) to prevent blocking legitimate users due to technical issues.

## Verification
- Logic matches `tk-wrapped-frontend`'s `userStatusStore.ts`.
- Logs added to console for debugging:
  - `Timezone check: { timezone, isUS }`
  - `Combined check result: { timezoneIsUS, geoIsUS, isInUS }`
