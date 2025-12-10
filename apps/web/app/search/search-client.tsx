"use client";

import { SearchFilters } from "@user-search/core";
import { Alert, Box, Container, Divider, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import InfiniteLoader from "../../components/InfiniteLoader";
import RateLimitBanner from "../../components/RateLimitBanner";
import SearchForm from "../../components/SearchForm";
import SearchResults from "../../components/SearchResults";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { filtersToSearchParams } from "../../lib/searchParams";
import { SearchApiResponse } from "../../lib/api";
import { fetchNextPage, hydrateFromServer } from "../../features/search/searchSlice";

interface Props {
  filters: SearchFilters;
  initialResponse: SearchApiResponse;
  queryKey: string;
}

const SearchClient = ({ filters, initialResponse, queryKey }: Props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalCount, hasMore, status, error, rateLimit } = useAppSelector(
    (state) => state.search
  );

  useEffect(() => {
    dispatch(hydrateFromServer({ response: initialResponse, filters, queryKey }));
  }, [dispatch, filters, initialResponse, queryKey]);

  const handleSubmit = useCallback(
    (nextFilters: SearchFilters) => {
      const params = filtersToSearchParams(nextFilters);
      router.push(`/search?${params.toString()}`);
    },
    [router]
  );

  const loadMore = useCallback(() => {
    dispatch(fetchNextPage());
  }, [dispatch]);

  return (
    <Container maxWidth="xl" className="py-2 space-y-6">
      <Paper className="shadow-sm">
        <Box className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Typography variant="h5" className="mb-3 font-semibold">
            GitHub User Search
          </Typography>
          <SearchForm initial={filters} onSubmit={handleSubmit} />
        </Box>
        <Box className="p-4">
          <Typography variant="subtitle2" className="mb-2 text-slate-600 dark:text-slate-300">
            Rate Limit
          </Typography>
          <RateLimitBanner rateLimit={rateLimit} />
        </Box>
      </Paper>

      {initialResponse?.error && (
        <Alert severity="error">
          {initialResponse.error.message}{" "}
          {initialResponse.error.type === "rate_limited" && "(rate limit)"}
        </Alert>
      )}

      <Paper className="shadow-sm">
        <Box className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <Typography variant="h6" className="font-semibold">
            Results
          </Typography>
          <Divider flexItem />
        </Box>
        <Box className="p-4">
          <SearchResults items={items} totalCount={totalCount} loading={status === "loading"} />
          <InfiniteLoader
            hasMore={hasMore}
            onLoadMore={loadMore}
            disabled={status === "loading" || Boolean(error)}
          />
          {error && (
            <Alert severity="warning" className="mt-4">
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchClient;
