export type SearchSort = "best" | "followers" | "repositories" | "joined";
export type SearchOrder = "desc" | "asc";
export type SearchIn = "login" | "name" | "email";
export type AccountType = "user" | "org";

export type NumericComparator = ">" | ">=" | "<" | "<=" | "=";

export interface NumericFilter {
  value: number;
  operator?: NumericComparator;
}

export interface DateFilter {
  value: string;
  operator?: NumericComparator;
}

export interface SearchFilters {
  term: string;
  searchIn?: SearchIn[];
  accountType?: AccountType;
  location?: string;
  language?: string;
  repos?: NumericFilter;
  created?: DateFilter;
  followers?: NumericFilter;
  sponsorable?: boolean;
  page?: number;
  perPage?: number;
  sort?: SearchSort;
  order?: SearchOrder;
}

export interface RateLimitInfo {
  limit?: number;
  remaining?: number;
  reset?: number;
  resetAt?: string;
  resource?: string;
}

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  score: number;
}

export interface GithubUserSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
}

export interface UserSummary {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  type: string;
  score: number;
}

export interface SearchResponse {
  totalCount: number;
  hasMore: boolean;
  items: UserSummary[];
  rateLimit?: RateLimitInfo;
  error?: { type: "rate_limited" | "invalid_request" | "server_error"; message: string };
}
