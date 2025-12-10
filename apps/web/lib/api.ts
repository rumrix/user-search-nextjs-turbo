import { SearchResponse } from "@user-search/core";

export interface SearchApiResponse extends SearchResponse {
  page: number;
  perPage: number;
}

export const fetchSearch = async (
  params: URLSearchParams,
  signal?: AbortSignal
): Promise<SearchApiResponse> => {
  const res = await fetch(`/api/github/search-users?${params.toString()}`, {
    method: "GET",
    signal
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message ?? "Request failed";
    throw new Error(message);
  }

  return json as SearchApiResponse;
};
