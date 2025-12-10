import { RateLimitInfo } from "@user-search/core";
import { Alert, Chip, Stack } from "@mui/material";

interface Props {
  rateLimit?: RateLimitInfo;
}

const RateLimitBanner = ({ rateLimit }: Props) => {
  if (!rateLimit) return null;
  return (
    <Alert severity="info" className="mt-2">
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip label={`Remaining ${rateLimit.remaining ?? "?"}/${rateLimit.limit ?? "?"}`} />
        {rateLimit.resetAt && <Chip label={`Resets at ${rateLimit.resetAt}`} />}
        {rateLimit.resource && <Chip label={`Resource: ${rateLimit.resource}`} />}
      </Stack>
    </Alert>
  );
};

export default RateLimitBanner;
