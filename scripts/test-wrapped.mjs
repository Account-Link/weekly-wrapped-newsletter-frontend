const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const uid = process.env.UID || "demo-uid";
const apiKey = process.env.API_KEY;

const headers = {
  "Content-Type": "application/json"
};
if (apiKey) headers["x-api-key"] = apiKey;

const response = await fetch(`${baseUrl}/api/wrapped`, {
  method: "POST",
  headers,
  body: JSON.stringify({ uid })
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

const fs = await import("fs");
fs.writeFileSync("report.html", html);
console.log(`Saved report.html from ${baseUrl}/api/wrapped`);
