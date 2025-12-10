import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SearchFilters,
  SearchResponse,
  UserSummary,
  dedupeUsersByLogin
} from "@user-search/core";
import { buildSearchParams } from "@user-search/core";
import { SearchApiResponse } from "../../lib/api";
import { RootState } from "../../store/store";

export interface SearchState {
  filters: SearchFilters;
  items: UserSummary[];
  totalCount: number;
  page: number;
  perPage: number;
  hasMore: boolean;
  status: "idle" | "loading" | "failed";
  error?: string;
  rateLimit?: SearchResponse["rateLimit"];
  requestId?: string;
  queryKey?: string;
}

const defaultFilters: SearchFilters = {
  term: "",
  page: 1,
  perPage: 20,
  sort: "best",
  order: "desc"
};

const initialState: SearchState = {
  filters: defaultFilters,
  items: [],
  totalCount: 0,
  page: 1,
  perPage: 20,
  hasMore: false,
  status: "idle"
};

export const fetchNextPage = createAsyncThunk<
  { response: SearchApiResponse; requestId: string },
  void,
  { state: RootState }
>(
  "search/fetchNextPage",
  async (_, { getState, signal, requestId, rejectWithValue }) => {
    const state = getState().search;
    const nextPage = state.page + 1;
    const params = buildSearchParams({ ...state.filters, page: nextPage, perPage: state.perPage });
    try {
      const res = await fetch(`/api/github/search-users?${params.toString()}`, { signal });
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json?.error?.message ?? "Request failed");
      }
      return { response: json as SearchApiResponse, requestId };
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return rejectWithValue("aborted");
      }
      return rejectWithValue(error?.message ?? "Request failed");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().search;
      if (!state.hasMore) return false;
      if (state.status === "loading") return false;
      return true;
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    hydrateFromServer: (
      state,
      action: PayloadAction<{ response: SearchApiResponse; filters: SearchFilters; queryKey: string }>
    ) => {
      state.filters = { ...defaultFilters, ...action.payload.filters, page: action.payload.response.page };
      state.items = action.payload.response.items ?? [];
      state.totalCount = action.payload.response.totalCount ?? 0;
      state.page = action.payload.response.page ?? 1;
      state.perPage = action.payload.response.perPage ?? action.payload.filters.perPage ?? 20;
      state.hasMore = Boolean(action.payload.response.hasMore);
      state.status = action.payload.response.error ? "failed" : "idle";
      state.error = action.payload.response.error?.message;
      state.rateLimit = action.payload.response.rateLimit;
      state.queryKey = action.payload.queryKey;
      state.requestId = undefined;
    },
    resetForQuery: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = { ...defaultFilters, ...action.payload, page: 1 };
      state.items = [];
      state.totalCount = 0;
      state.page = 1;
      state.hasMore = false;
      state.status = "idle";
      state.error = undefined;
      state.rateLimit = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextPage.pending, (state, action) => {
        if (state.status === "loading") return;
        state.status = "loading";
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        const response = action.payload.response;
        state.items = dedupeUsersByLogin([...state.items, ...(response.items ?? [])]);
        state.totalCount = response.totalCount ?? state.totalCount;
        state.page = response.page ?? state.page + 1;
        state.hasMore = Boolean(response.hasMore);
        state.rateLimit = response.rateLimit;
        state.status = "idle";
        state.error = response.error?.message;
        state.requestId = undefined;
      })
      .addCase(fetchNextPage.rejected, (state, action) => {
        if (action.payload === "aborted") return;
        if (state.requestId && state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = (action.payload as string) ?? action.error.message;
        state.requestId = undefined;
      });
  }
});

export const { hydrateFromServer, resetForQuery } = searchSlice.actions;
export default searchSlice.reducer;
