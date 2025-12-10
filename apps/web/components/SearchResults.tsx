import { UserSummary, buildAvatarProxyUrl } from "@user-search/core";
import { Card, CardContent, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import AvatarCanvas from "./AvatarCanvas";

interface Props {
  items: UserSummary[];
  totalCount: number;
  loading: boolean;
}

const SearchResults = ({ items, totalCount, loading }: Props) => {
  if (!loading && items.length === 0) {
    return <div className="text-sm text-slate-500">No results yet. Try searching for a login.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Results: {totalCount}</span>
        {loading && <span className="text-primary-500">Loading more…</span>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((user) => (
          <Card key={user.login} className="shadow-sm">
            <CardContent className="flex gap-3">
              <div className="shrink-0">
                <AvatarCanvas
                  size={80}
                  alt={user.login}
                  src={buildAvatarProxyUrl(user.avatarUrl)}
                  fallbackSrc={user.avatarUrl}
                />
              </div>
              <Stack spacing={1} className="flex-1">
                <Typography variant="subtitle1" className="font-semibold">
                  <Link href={{ pathname: user.htmlUrl }} target="_blank">
                    {user.login}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {user.type}
                </Typography>
                <Chip
                  label={`Score ${typeof user.score === "number" ? user.score.toFixed(1) : "–"}`}
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
        {loading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <Card key={`skeleton-${idx}`}>
              <CardContent className="flex gap-3">
                <Skeleton variant="circular" width={64} height={64} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="50%" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SearchResults;
