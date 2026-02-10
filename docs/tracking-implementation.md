# Tracking Implementation Scheme & Core Metrics

Based on your request, we have implemented a comprehensive tracking system covering Referral Flow, Unsubscribe Flow, and Share Flow. This document outlines the implementation details, deduplication strategies, and metric definitions.

## 1. Tracking Implementation Overview

All tracking events are sent via our unified `trackEvent` (Server-side API) or `trackShareSaved` (Client-side Firebase Analytics) functions.

### 1.1 Referral Flow (Invite + OAuth)

**File:** `app/invitation/InviteFlow.tsx`

| Event                       | Trigger                | Deduplication Strategy       | Scope                                    |
| --------------------------- | ---------------------- | ---------------------------- | ---------------------------------------- |
| `referral_landing_view`     | Page Load              | **None** (Track every visit) | -                                        |
| `referral_landing_click`    | Click "Find out"       | **Device ID** (LocalStorage) | `tracked_referral_landing_click`         |
| `referral_loading_start`    | Loading Start          | **Device ID** (LocalStorage) | `tracked_referral_loading_start`         |
| `referral_loading_complete` | Loading Done           | **Device ID** (LocalStorage) | `tracked_referral_loading_complete`      |
| `referral_oauth_start`      | Click "Connect TikTok" | **Device ID** (LocalStorage) | `tracked_referral_oauth_start`           |
| `referral_oauth_success`    | Auth Success           | **User ID** (LocalStorage)   | `tracked_referral_oauth_success_{uid}`   |
| `referral_oauth_fail`       | Auth Fail              | **None**                     | -                                        |
| `referral_processing_view`  | Processing Screen      | **User ID** (LocalStorage)   | `tracked_referral_processing_view_{uid}` |
| `referral_complete`         | Success Screen         | **User ID** (LocalStorage)   | `tracked_referral_complete_{uid}`        |
| `referral_invite_click`     | Click "Invite"         | **None**                     | -                                        |

**Time Metrics:**

- `loading_duration`: `referral_loading_complete` timestamp - `referral_landing_click` timestamp. (Passed in `extraData`)
- `privacy_read_duration`: `referral_oauth_start` timestamp - `referral_loading_complete` timestamp. (Passed in `extraData`)

### 1.2 Unsubscribe Flow

**File:** `app/unsubscribe/content.tsx`

| Event                   | Trigger              | Deduplication Strategy     | Scope                               |
| ----------------------- | -------------------- | -------------------------- | ----------------------------------- |
| `unsubscribe_page_view` | Page Load            | **None**                   | -                                   |
| `unsubscribe_confirm`   | Click "Yes"          | **User ID** (LocalStorage) | `tracked_unsubscribe_confirm_{uid}` |
| `unsubscribe_cancel`    | Click "No"           | **Session** (React Ref)    | Component Lifecycle                 |
| `resubscribe`           | Click "Re-subscribe" | **None**                   | -                                   |

### 1.3 Share Image Saved

**File:** `src/lib/client-analytics.ts` (Called from `app/share/download/content.tsx`)

| Event         | Trigger        | Deduplication Strategy          | Scope                                      |
| ------------- | -------------- | ------------------------------- | ------------------------------------------ |
| `share_saved` | Download Click | **User ID + Email ID + Action** | `tracked_share_saved_{uid}_{eid}_{action}` |

_Supported Actions:_ `share_week`, `share_stats`, `share_twitter_saved`, `share_linkedin_saved`, `share_whatsapp_saved`, etc.

### 1.4 Button CTR (Email/Web) & Social Specifics

**Files:** `src/lib/tracking/types.ts`

The following actions have been defined in the schema to support granular social tracking. These can be used when specific social buttons are added to the Email Template or Share Page UI:

| Action Code             | Intended Use                     |
| ----------------------- | -------------------------------- |
| `click_share_twitter`   | User clicks Twitter icon         |
| `click_share_linkedin`  | User clicks LinkedIn icon        |
| `click_share_copy_link` | User clicks Copy Link icon       |
| `click_invite_friend`   | User clicks Invite Friend button |
| `click_unsubscribe`     | User clicks Unsubscribe link     |

---

## 2. Core Metrics Definitions

### 2.1 Engagement Metrics

- **Open Rate** = `unique opens` / `emails delivered`
- **CTR (Click-Through Rate)** = `unique clicks (any button)` / `emails delivered`
- **CTOR (Click-to-Open Rate)** = `unique clicks` / `unique opens`

### 2.2 Growth Metrics

- **Share Rate** = `(share_week + share_stats + share_saved)` / `unique opens`
  - _Note: `share_week` and `share_stats` are tracked via redirect URLs in the email._
  - _Note: `share_saved` is tracked on the download landing page._
- **Invite Rate** = `referral_invite_click` / `unique opens`
  - _Note: This measures how many people reached the end of the funnel and clicked invite, relative to openers._

### 2.3 Funnel Metrics

- **Landing to OAuth Conversion** = `referral_oauth_start` / `referral_landing_click`
- **OAuth Success Rate** = `referral_oauth_success` / `referral_oauth_start`
- **Unsubscribe Rate** = `unsubscribe_confirm` / `emails delivered`

### 2.4 Time Metrics (Calculated in Analysis)

- **Avg Loading Duration** = Average of `extraData.duration` in `referral_loading_complete` events.
- **Avg Privacy Read Time** = Average of `extraData.duration` in `referral_oauth_start` events.

## 3. Data Dictionary (New Actions)

Updated `src/lib/tracking/types.ts` with:

- `referral_flow` module
- All `referral_*` actions
- All `unsubscribe_*` actions
