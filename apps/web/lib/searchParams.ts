import { SearchFilters, SearchIn, SearchOrder, SearchSort } from "@user-search/core";

const parseNumericFilter = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/(>=|<=|>|<|=)?(.+)/);
  if (!match) return undefined;
  const operator = (match[1] as any) ?? ">=";
  const numericCandidate = Number(match[2]);
  const parsedValue = Number.isNaN(numericCandidate) ? match[2] : numericCandidate;
  return { operator, value: parsedValue as any };
};

export const filtersFromSearchParams = (
  params: URLSearchParams | Record<string, string | string[] | undefined>
): SearchFilters => {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const searchInParam = get("in");
  const searchIn = searchInParam
    ? searchInParam
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean) as SearchIn[]
    : undefined;

  const sort = (get("sort") as SearchSort) ?? "best";
  const order = (get("order") as SearchOrder) ?? "desc";

  const filters: SearchFilters = {
    term: get("term") ?? "",
    searchIn,
    accountType: get("type") === "org" ? "org" : get("type") === "user" ? "user" : undefined,
    location: get("location") ?? undefined,
    language: get("language") ?? undefined,
    repos: parseNumericFilter(get("repos")),
    followers: parseNumericFilter(get("followers")),
    created: parseNumericFilter(get("created")),
    sponsorable: get("sponsorable") === "true",
    page: Number(get("page") ?? "1") || 1,
    perPage: Number(get("perPage") ?? "20") || 20,
    sort,
    order
  };

  return filters;
};

export const filtersToSearchParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.term) params.set("term", filters.term);
  if (filters.searchIn && filters.searchIn.length > 0) params.set("in", filters.searchIn.join(","));
  if (filters.accountType) params.set("type", filters.accountType);
  if (filters.location) params.set("location", filters.location);
  if (filters.language) params.set("language", filters.language);
  const numeric = (key: string, filter?: { operator?: string; value: number }) => {
    if (!filter || filter.value === undefined || Number.isNaN(filter.value)) return;
    params.set(key, `${filter.operator ?? ">="}${filter.value}`);
  };
  numeric("repos", filters.repos);
  numeric("followers", filters.followers);
  numeric("created", filters.created);
  if (filters.sponsorable) params.set("sponsorable", "true");
  params.set("page", String(filters.page ?? 1));
  params.set("perPage", String(filters.perPage ?? 20));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  return params;
};
