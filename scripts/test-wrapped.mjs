import fs from "node:fs";
import nodemailer from "nodemailer";

const baseUrl =
  process.env.BASE_URL ||
  "https://weekly-wrapped-newsletter-frontend.vercel.app";
const apiKey = process.env.API_KEY;
const emailTo = process.env.EMAIL_TO || "zhx2gang@gmail.com";

const payload = process.env.PAYLOAD_JSON
  ? JSON.parse(process.env.PAYLOAD_JSON)
  : {
      uid: "user_001",
      params: {
        period_start: "2025-01-20T00:00:00",
        period_end: "2025-01-27T00:00:00",
        created_at: "2026-01-30T02:18:02.847658",
        updated_at: "2026-01-30T02:18:02.847658",
        send_status: "sent",
        feeding_state: "curious",
        trend_name: "Cooking Hacks",
        trend_type: "sound",
        discovery_rank: 3,
        total_discoverers: 120,
        origin_niche_text: "home kitchen tips",
        spread_end_text: "viral in 5 cities",
        reach_start: 0.02,
        reach_end: 0.15,
        current_reach: 0.12,
        total_videos: 48,
        total_time: 7200,
        pre_total_time: 6500,
        miles_scrolled: 12,
        topics: [
          {
            topic: "cooking",
            pic_url: "https://example.com/1.jpg",
          },
          {
            topic: "life hacks",
            pic_url: "https://example.com/2.jpg",
          },
        ],
        timezone: "Asia/Shanghai",
        rabbit_hole_datetime: "2025-01-25T22:30:00",
        rabbit_hole_date: "2025-01-25",
        rabbit_hole_time: "22:30",
        rabbit_hole_count: 2,
        rabbit_hole_category: "food",
        nudge_text: "You discovered 2 rabbit holes this week!",
      },
    };

const envFilePath = process.env.ENV_FILE || ".env.local";
if (!process.env.SMTP_HOST && fs.existsSync(envFilePath)) {
  const lines = fs.readFileSync(envFilePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(SMTP_[A-Z_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

const headers = {
  "Content-Type": "application/json",
};
if (apiKey) headers["x-api-key"] = apiKey;

const response = await fetch(`${baseUrl}/api/wrapped`, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`Request failed: ${response.status} ${text}`);
}

const json = await response.json();
const html = json?.html;
if (!html) {
  throw new Error("Missing html in response");
}

let transporter;
let isEthereal = false;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  isEthereal = true;
}

const info = await transporter.sendMail({
  from: process.env.SMTP_FROM || '"FYP Scout" <no-reply@example.com>',
  to: emailTo,
  subject: "FYP Scout Weekly Wrapped (Custom Payload)",
  html,
});

const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) || "" : "";
console.log(
  JSON.stringify(
    {
      messageId: info.messageId,
      recipient: emailTo,
      mode: isEthereal ? "Ethereal" : "SMTP",
      previewUrl,
    },
    null,
    2,
  ),
);
