import type { WeeklyReportData } from "@/domain/report/types";

export const mockReports: Record<string, WeeklyReportData> = {
  curious: {
    weekRange: "Jan 18 - Jan 24",
    user: { name: "Ava" },
    feedling: { state: "curious" },
    trend: {
      name: "Leave Em Alone",
      rank: 47,
      totalDiscoverers: 2847,
      origin: "#BeautyTik",
      currentSpread: "going_mainstream",
      penetrationStart: 0.2,
      penetrationEnd: 8
    },
    stats: {
      totalVideos: 9222,
      totalTimeMinutes: 1154,
      lastWeekTimeMinutes: 1290,
      lateNightPercentage: 28,
      milesScrolled: 18,
      contentDiversityScore: 72,
      brainrotPercentage: 12
    },
    newTopics: ["Hongkong Vlog", "Pottery DIY", "Jazz Covers"],
    rabbitHole: {
      hasRabbitHole: false,
      day: "Wednesday",
      time: "3:09 AM",
      count: 38,
      category: "Comedy"
    },
    nudge: { type: "default" }
  },
  excited: {
    weekRange: "Jan 18 - Jan 24",
    user: { name: "Mason" },
    feedling: { state: "excited" },
    trend: {
      name: "Leave Em Alone",
      rank: 18,
      totalDiscoverers: 2847,
      origin: "#BeautyTik",
      currentSpread: "spreading",
      penetrationStart: 0.2,
      penetrationEnd: 4
    },
    stats: {
      totalVideos: 6100,
      totalTimeMinutes: 980,
      lastWeekTimeMinutes: 900,
      lateNightPercentage: 22,
      milesScrolled: 12,
      contentDiversityScore: 55,
      brainrotPercentage: 8
    },
    newTopics: ["Indie Film", "Night Run"],
    rabbitHole: {
      hasRabbitHole: false,
      day: "Monday",
      time: "11:20 PM",
      count: 24,
      category: "Music"
    },
    nudge: { type: "default" }
  },
  sleepy: {
    weekRange: "Jan 18 - Jan 24",
    user: { name: "Nina" },
    feedling: { state: "sleepy" },
    trend: {
      name: "Silent Loop",
      rank: null,
      totalDiscoverers: 4021,
      origin: "#ArtTok",
      currentSpread: "almost_everywhere",
      penetrationStart: 0.2,
      penetrationEnd: 10
    },
    stats: {
      totalVideos: 11880,
      totalTimeMinutes: 1500,
      lastWeekTimeMinutes: 1320,
      lateNightPercentage: 52,
      milesScrolled: 32,
      contentDiversityScore: 44,
      brainrotPercentage: 18
    },
    newTopics: ["Deep Sleep Tips"],
    rabbitHole: {
      hasRabbitHole: true,
      day: "Saturday",
      time: "2:34 AM",
      count: 160,
      category: "Comedy"
    },
    nudge: { type: "late_night", limitTime: "2 AM" }
  },
  dizzy: {
    weekRange: "Jan 18 - Jan 24",
    user: { name: "Leo" },
    feedling: { state: "dizzy" },
    trend: {
      name: "Glow Up",
      rank: 980,
      totalDiscoverers: 2847,
      origin: "#GlowTok",
      currentSpread: "everywhere",
      penetrationStart: 0.2,
      penetrationEnd: 12
    },
    stats: {
      totalVideos: 10400,
      totalTimeMinutes: 1420,
      lastWeekTimeMinutes: 1100,
      lateNightPercentage: 36,
      milesScrolled: 20,
      contentDiversityScore: 35,
      brainrotPercentage: 32
    },
    newTopics: ["Snack Reviews", "Phone Wallpapers"],
    rabbitHole: {
      hasRabbitHole: true,
      day: "Friday",
      time: "1:45 AM",
      count: 88,
      category: "Meme"
    },
    nudge: { type: "brainrot" }
  },
  cozy: {
    weekRange: "Jan 18 - Jan 24",
    user: { name: "Aria" },
    feedling: { state: "cozy" },
    trend: {
      name: "Calm Desk Setup",
      rank: 320,
      totalDiscoverers: 2847,
      origin: "#WorkTok",
      currentSpread: "going_mainstream",
      penetrationStart: 0.2,
      penetrationEnd: 8
    },
    stats: {
      totalVideos: 7800,
      totalTimeMinutes: 990,
      lastWeekTimeMinutes: 1140,
      lateNightPercentage: 18,
      milesScrolled: 14,
      contentDiversityScore: 58,
      brainrotPercentage: 10
    },
    newTopics: ["Desk Setup", "Morning Walks"],
    rabbitHole: {
      hasRabbitHole: false,
      day: "Thursday",
      time: "10:15 PM",
      count: 40,
      category: "Lifestyle"
    },
    nudge: { type: "default" }
  }
};
