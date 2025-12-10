import { buildSearchParams } from "@user-search/core";
import { filtersFromSearchParams, filtersToSearchParams } from "../lib/searchParams";

describe("search params helpers", () => {
  it("round trips filters", () => {
    const params = filtersToSearchParams({
      term: "john",
      searchIn: ["login", "email"],
      accountType: "user",
      language: "ts",
      location: "seoul",
      repos: { operator: ">=", value: 5 },
      followers: { operator: ">", value: 10 },
      created: { operator: ">=", value: "2020-01-01" },
      sponsorable: true,
      sort: "followers",
      order: "desc",
      page: 1,
      perPage: 20
    });

    const filters = filtersFromSearchParams(params);
    expect(filters.term).toBe("john");
    expect(filters.searchIn).toEqual(["login", "email"]);
    expect(filters.accountType).toBe("user");
    expect(filters.sponsorable).toBe(true);
  });

  it("builds search params for API", () => {
    const params = buildSearchParams({
      term: "john",
      sort: "followers",
      order: "desc",
      page: 2,
      perPage: 10
    });
    expect(params.get("q")).toBe("john");
    expect(params.get("sort")).toBe("followers");
    expect(params.get("page")).toBe("2");
  });
});
