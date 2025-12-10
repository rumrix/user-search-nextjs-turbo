import {
  buildAvatarProxyUrl,
  buildSearchParams,
  buildSearchQuery,
  dedupeUsersByLogin,
  getNextPage,
  mapSearchResponse,
  parseRateLimit,
  shouldShortCircuitRateLimit
} from "../src";
import { GithubUserSearchResponse } from "../src/searchTypes";

const makeHeaders = (entries: Record<string, string>) => {
  const headers = new Headers();
  Object.entries(entries).forEach(([k, v]) => headers.append(k, v));
  return headers;
};

describe("query builder", () => {
  it("builds query with qualifiers", () => {
    const query = buildSearchQuery({
      term: "john",
      searchIn: ["login", "email"],
      accountType: "user",
      location: "seoul",
      language: "typescript",
      repos: { value: 5, operator: ">=" },
      followers: { value: 10, operator: ">" },
      created: { value: 20200101, operator: ">=" },
      sponsorable: true
    });
    expect(query).toContain("john");
    expect(query).toContain("in:login,email");
    expect(query).toContain("type:user");
    expect(query).toContain("location:seoul");
    expect(query).toContain("language:typescript");
    expect(query).toContain("repos:>=5");
    expect(query).toContain("followers:>10");
    expect(query).toContain("created:>=20200101");
    expect(query).toContain("is:sponsorable");
  });

  it("builds URLSearchParams with defaults", () => {
    const params = buildSearchParams({
      term: "",
      page: 2,
      perPage: 15,
      sort: "followers",
      order: "desc"
    });
    expect(params.get("q")).toBe("*");
    expect(params.get("page")).toBe("2");
    expect(params.get("per_page")).toBe("15");
    expect(params.get("sort")).toBe("followers");
    expect(params.get("order")).toBe("desc");
  });
});

describe("dedupe and pagination", () => {
  it("dedupes by login", () => {
    const deduped = dedupeUsersByLogin([
      { login: "a" },
      { login: "b" },
      { login: "a" }
    ]);
    expect(deduped).toHaveLength(2);
    expect(deduped.map((u) => u.login)).toEqual(["a", "b"]);
  });

  it("calculates next page correctly", () => {
    expect(getNextPage(1, 20, 35)).toBe(2);
    expect(getNextPage(2, 20, 35)).toBe(null);
  });
});

describe("rate limits", () => {
  it("parses rate limit headers", () => {
    const headers = makeHeaders({
      "x-ratelimit-limit": "30",
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "999999"
    });
    const info = parseRateLimit(headers);
    expect(info.limit).toBe(30);
    expect(info.remaining).toBe(0);
    expect(info.reset).toBe(999999);
    expect(info.resetAt).toBeDefined();
  });

  it("detects when to short circuit on rate limit", () => {
    const now = Math.floor(Date.now() / 1000);
    const info = { remaining: 0, reset: now + 120 } as any;
    expect(shouldShortCircuitRateLimit(info)).toBe(true);
  });
});

describe("mapping", () => {
  it("maps GitHub payload to SearchResponse", () => {
    const payload: GithubUserSearchResponse = {
      total_count: 21,
      incomplete_results: false,
      items: [
        {
          login: "a",
          id: 1,
          avatar_url: "http://example.com/a.png",
          html_url: "http://example.com",
          type: "User",
          score: 1
        }
      ]
    };
    const mapped = mapSearchResponse(payload, 1, 20, { remaining: 1, limit: 30 });
    expect(mapped.items[0].login).toBe("a");
    expect(mapped.hasMore).toBe(true);
    expect(mapped.rateLimit?.limit).toBe(30);
  });
});

describe("avatar proxy url", () => {
  it("builds proxied avatar url", () => {
    const proxied = buildAvatarProxyUrl("https://avatars.githubusercontent.com/u/1");
    expect(proxied).toContain("src=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F1");
  });
});
