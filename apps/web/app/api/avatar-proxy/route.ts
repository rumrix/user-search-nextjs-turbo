import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["avatars.githubusercontent.com"]);

export const GET = async (request: NextRequest) => {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "Missing src" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(url.toString(), {
    headers: { Accept: "image/*" }
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Failed to load avatar" }, { status: upstream.status });
  }

  const arrayBuffer = await upstream.arrayBuffer();
  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
};
