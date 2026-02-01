import { NextResponse } from "next/server.js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get("url");
  const fileName = requestUrl.searchParams.get("filename") || "image.png";

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { error: "Unsupported url protocol" },
      { status: 400 },
    );
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream error ${upstream.status}` },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await upstream.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "no-store",
    },
  });
}
