import { NextRequest, NextResponse } from "next/server";
import {
  GithubUserSearchResponse,
  computeBackoffMs,
  mapSearchResponse,
  parseRateLimit,
  shouldShortCircuitRateLimit
} from "@user-search/core";

const GITHUB_SEARCH = "https://api.github.com/search/users";
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfter = (header: string | null) => {
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = new Date(header);
  const diff = date.getTime() - Date.now();
  return diff > 0 ? diff : null;
};

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { error: { type: "invalid_request", message: "Missing q parameter" } },
      { status: 400 }
    );
  }

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const perPage = Number(searchParams.get("per_page") ?? "20") || 20;
  const sort = searchParams.get("sort") ?? undefined;
  const order = searchParams.get("order") ?? "desc";

  if (process.env.MOCK_GITHUB === "1") {
    const mockUsers: GithubUserSearchResponse = {
      total_count: 3,
      incomplete_results: false,
      items: [
        {
          login: "jane",
          id: 1,
          avatar_url: "https://avatars.githubusercontent.com/u/1",
          html_url: "https://github.com/jane",
          type: "User",
          score: 42
        },
        {
          login: "john",
          id: 2,
          avatar_url: "https://avatars.githubusercontent.com/u/2",
          html_url: "https://github.com/john",
          type: "User",
          score: 33
        },
        {
          login: "mike",
          id: 3,
          avatar_url: "https://avatars.githubusercontent.com/u/3",
          html_url: "https://github.com/mike",
          type: "User",
          score: 22
        }
      ]
    };

    const start = (page - 1) * perPage;
    const sliced = { ...mockUsers, items: mockUsers.items.slice(start, start + perPage) };
    const mapped = mapSearchResponse(sliced, page, perPage, { remaining: 999, limit: 1000 });
    return NextResponse.json(
      { ...mapped, page, perPage },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: "GITHUB_TOKEN is not configured. Please set it in your .env."
        }
      },
      { status: 500 }
    );
  }

  const githubParams = new URLSearchParams({
    q,
    page: String(page),
    per_page: String(perPage),
    order
  });
  if (sort) githubParams.set("sort", sort);

  const url = `${GITHUB_SEARCH}?${githubParams.toString()}`;

  let lastRateLimit;
  let response: Response | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "user-search-nextjs-turbo"
      },
      cache: "no-store"
    });

    lastRateLimit = parseRateLimit(response.headers);

    if (response.status === 429 || response.headers.has("retry-after")) {
      if (shouldShortCircuitRateLimit(lastRateLimit)) {
        return NextResponse.json(
          {
            error: {
              type: "rate_limited",
              message: "Rate limit exceeded. Please retry after reset."
            },
            rateLimit: lastRateLimit,
            page,
            perPage
          },
          { status: 429 }
        );
      }
      const retryAfterMs =
        parseRetryAfter(response.headers.get("retry-after")) ?? computeBackoffMs(attempt);
      await sleep(retryAfterMs);
      continue;
    }

    if (!response.ok && attempt < MAX_RETRIES - 1) {
      await sleep(computeBackoffMs(attempt));
      continue;
    }

    break;
  }

  if (!response) {
    return NextResponse.json(
      { error: { type: "server_error", message: "No response from GitHub." } },
      { status: 500 }
    );
  }

  lastRateLimit = parseRateLimit(response.headers);

  if (response.status === 429) {
    return NextResponse.json(
      {
        error: { type: "rate_limited", message: "Rate limited by GitHub" },
        rateLimit: lastRateLimit,
        page,
        perPage
      },
      { status: 429 }
    );
  }

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: `GitHub error ${response.status}: ${text}`.slice(0, 300)
        },
        rateLimit: lastRateLimit,
        page,
        perPage
      },
      { status: response.status }
    );
  }

  const payload = (await response.json()) as GithubUserSearchResponse;
  const mapped = mapSearchResponse(payload, page, perPage, lastRateLimit);

  return NextResponse.json(
    { ...mapped, page, perPage },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    }
  );
};
