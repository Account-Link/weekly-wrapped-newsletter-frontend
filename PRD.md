# Role

You are a Senior Frontend Engineer and System Architect specializing in Data Visualization and Email Engineering.

# Context

We are building "FYP Scout", a TikTok Weekly Newsletter using **Next.js**, **TypeScript**, and **React Email**.
I have the final PRD and Design specs. I need you to translate the business logic, data variants, and copy mapping into structured TypeScript code.

# Task

Create the foundational data layer for the email template. This includes:

1.  **TypeScript Interfaces**: Defining the raw data structure coming from the backend.
2.  **Logic Mappers**: Constants/Objects that map specific data states (e.g., Feedling status, Trend rank) to the specific copy defined in the PRD.
3.  **Helper Functions**: Pure functions to process raw data into display-ready strings.

---

# 1. Data Structure Specifications (Types)

Please define the following interfaces in a file named `types.ts`.

## Core Enums

- **FeedlingState**: 'curious' | 'excited' | 'cozy' | 'sleepy' | 'dizzy'
- **TrendStatus**: 'spreading' | 'going_mainstream' | 'almost_everywhere' | 'everywhere'
- **DiscoveryType**: 'early' (top 40%) | 'late' (bottom 60%) | 'missed'

## Interface: WeeklyReportData (The Input)

The raw JSON payload will contain:

- `weekRange`: string (e.g., "Jan 18 - Jan 24")
- `user`: { name: string, avatarUrl?: string }
- `feedling`: { state: FeedlingState } // Derived from logic, or passed directly
- `trend`: {
  name: string,
  rank: number,
  totalDiscoverers: number,
  origin: string, // e.g., "#BeautyTik"
  currentSpread: TrendStatus,
  penetrationStart: number, // e.g., 0.2
  penetrationEnd: number // e.g., 12
  }
- `stats`: {
  totalVideos: number,
  totalTimeMinutes: number, // Converted from hours/min
  lastWeekTimeMinutes: number, // To calculate comparison
  lateNightPercentage: number,
  milesScrolled: number
  }
- `newTopics`: string[] // Array of topic names. Max 3.
- `rabbitHole`: {
  hasRabbitHole: boolean,
  day?: string,
  time?: string,
  count?: number,
  category?: string
  }
- `nudge`: {
  type: 'late_night' | 'rabbit_hole' | 'brainrot' | 'time_increase' | 'default',
  limitTime?: string // e.g. "3 AM"
  }

---

# 2. Copy & Logic Mapping (Constants)

Please create a file named `logic-maps.ts`. Implement the following dictionaries/maps based on the PRD text strictly.

## A. Feedling Status Copy

Map `FeedlingState` to the exact copy:

- **curious**: "This week you explored a lot of new corners in TikTok."
- **excited**: "Your trend instincts paid off this week."
- **cozy**: "You had a balanced week on TikTok."
- **sleepy**: "You spent a lot of late nights scrolling this week."
- **dizzy**: "Your feed got a little chaotic this week."

## B. Discovery Rank Copy

Create a function `getDiscoveryText(rank: number, total: number)` that determines the type and returns the copy.

- **Logic**:
  - If `rank` <= `total * 0.4`: **Early Discoverer**
    - Copy: `You were #${rank} to discover out of ${total} people.`
  - If `rank` > `total * 0.4` (and user saw it): **Late Discoverer**
    - Copy: `You joined at #${rank} out of ${total} people. Fashionably late.`
  - If `rank` is null (missed): **Not Exposed**
    - Copy: `This blew up but your feed missed it. Your taste might be more niche than you think.`

## C. Spread Progress Visuals

Map `TrendStatus` to visual labels (Start % -> End %):

- **spreading**: "0.2% → 4%"
- **going_mainstream**: "0.2% → 8%"
- **almost_everywhere**: "0.2% → 10%"
- **everywhere**: "0.2% → 12%"

## D. Time Comparison Copy

Compare `stats.totalTimeMinutes` vs `stats.lastWeekTimeMinutes`:

- **Decrease > 5%**: "{X}h {X}min less than last week"
- **Decrease 2-5%**: "Slightly less than last week"
- **Change within ±2%**: "About the same as last week"
- **Increase 2-5%**: "A bit more than last week"
- **Increase > 5%**: "{X}h {X}min more than last week"

## E. Miles Scrolled Copy

Map `stats.milesScrolled` to copy:

- **< 5**: "Your thumb ran {X} miles - a nice walk."
- **5 - 12**: "Your thumb ran {X} miles - a 10K run."
- **13 - 26**: "Your thumb ran {X} miles - a half marathon."
- **> 26**: "Your thumb ran {X} miles - more than a full marathon."

## F. Nudge Copy

Map `nudge.type` to copy:

- **late_night**: "Try putting your phone down before {limitTime} this week"
- **rabbit_hole**: "When you notice the drift, try searching for something specific"
- **brainrot**: "Try using 'Not Interested' on a few videos this week"
- **time_increase**: "Try setting a scroll limit for yourself"
- **default**: "Your Feedling had a balanced week. Keep it up!"

---

# 3. Processing Logic (Helpers)

In `utils.ts`, create logic to determine priorities (Feedling State & Nudge):

## Feedling State Priority (Function: `calculateFeedlingState`)

Input: User data.
Logic (Return the HIGHEST priority met):

1.  **excited**: User hit early trend (discovery type is 'early').
2.  **curious**: Content diversity score > 60 OR > 3 new topics.
3.  **cozy**: Screen time decreased vs last week AND no deep rabbit holes.
4.  **sleepy**: Rabbit hole > 100 videos OR miles scrolled > 26.
5.  **dizzy**: Brainrot category > 20% of feed.

## Nudge Priority (Function: `determineNudgeType`)

Input: User data.
Logic (Return the HIGHEST priority met):

1.  **rabbit_hole**: Longest streak > 100 videos.
2.  **late_night**: (Assumed based on late night %) Late night usage is heavy.
3.  **time_increase**: Watch time increased > 30%.
4.  **default**: None of above.

---

# Output Requirement

Please generate the code for `types.ts`, `logic-maps.ts`, and `utils.ts` ensuring all the specific copy and logic rules above are implemented correctly. Use strict TypeScript.
