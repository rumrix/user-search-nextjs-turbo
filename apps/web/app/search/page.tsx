import { buildSearchParams, SearchResponse } from "@user-search/core";
import { Suspense } from "react";
import { fetchBaseUrl } from "../../lib/serverConfig";
import { filtersFromSearchParams, filtersToSearchParams } from "../../lib/searchParams";
import { SearchApiResponse } from "../../lib/api";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

const fetchInitial = async (params: URLSearchParams): Promise<SearchApiResponse> => {
  const baseUrl = fetchBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/github/search-users?${params.toString()}`, {
      cache: "no-store"
    });
    const json = (await res.json()) as SearchApiResponse | { error?: SearchResponse["error"] };
    return {
      page: (json as SearchApiResponse).page ?? Number(params.get("page") ?? "1"),
      perPage: (json as SearchApiResponse).perPage ?? Number(params.get("per_page") ?? "20"),
      items: (json as SearchApiResponse).items ?? [],
      totalCount: (json as SearchApiResponse).totalCount ?? 0,
      hasMore: (json as SearchApiResponse).hasMore ?? false,
      rateLimit: (json as SearchApiResponse).rateLimit,
      error: (json as any).error
    };
  } catch (error: any) {
    return {
      page: Number(params.get("page") ?? "1"),
      perPage: Number(params.get("per_page") ?? "20"),
      items: [],
      totalCount: 0,
      hasMore: false,
      error: { type: "server_error", message: error?.message ?? "Failed to load" }
    };
  }
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });
  const filters = filtersFromSearchParams(params);
  const githubParams = buildSearchParams(filters);
  const initialResponse = await fetchInitial(githubParams);
  const queryKey = filtersToSearchParams(filters).toString();

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SearchClient
        key={queryKey}
        filters={filters}
        initialResponse={initialResponse}
        queryKey={queryKey}
      />
    </Suspense>
  );
}
