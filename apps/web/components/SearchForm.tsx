import { useMemo, useState, type FormEvent } from "react";
import {
  AccountType,
  NumericComparator,
  SearchFilters,
  SearchIn,
  SearchOrder,
  SearchSort
} from "@user-search/core";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

interface Props {
  initial: SearchFilters;
  onSubmit: (filters: SearchFilters) => void;
}

const sortOptions: { value: SearchSort; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "followers", label: "Followers" },
  { value: "repositories", label: "Repositories" },
  { value: "joined", label: "Joined" }
];

const searchInOptions: SearchIn[] = ["login", "name", "email"];
const comparators: NumericComparator[] = [">=", ">", "<=", "<", "="];

const inputBorderSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: "transparent",
    "& .MuiOutlinedInput-input": {
      paddingTop: "0.85rem",
      paddingBottom: "0.85rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      lineHeight: 1.5
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cbd5e1"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#94a3b8"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0284c7"
    }
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "transparent",
    paddingRight: "6px",
    alignContent: "center"
  }
};

type NumericState = { operator: NumericComparator; value: string };

const SearchForm = ({ initial, onSubmit }: Props) => {
  const [term, setTerm] = useState(initial.term ?? "");
  const [searchIn, setSearchIn] = useState<SearchIn[]>(initial.searchIn ?? ["login", "name"]);
  const [accountType, setAccountType] = useState<AccountType | undefined>(initial.accountType);
  const [location, setLocation] = useState(initial.location ?? "");
  const [language, setLanguage] = useState(initial.language ?? "");
  const [repos, setRepos] = useState<NumericState>({
    operator: (initial.repos?.operator as NumericComparator) ?? ">=",
    value: initial.repos?.value ? String(initial.repos.value) : ""
  });
  const [followers, setFollowers] = useState<NumericState>({
    operator: (initial.followers?.operator as NumericComparator) ?? ">=",
    value: initial.followers?.value ? String(initial.followers.value) : ""
  });
  const [created, setCreated] = useState<NumericState>({
    operator: (initial.created?.operator as NumericComparator) ?? ">=",
    value: initial.created?.value ? String(initial.created.value) : ""
  });
  const [sponsorable, setSponsorable] = useState(Boolean(initial.sponsorable));
  const [sort, setSort] = useState<SearchSort>(initial.sort ?? "best");
  const [order, setOrder] = useState<SearchOrder>(initial.order ?? "desc");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toNumber = (value: string) => {
      const numeric = Number(value);
      return Number.isNaN(numeric) ? undefined : numeric;
    };

    const nextFilters: SearchFilters = {
      ...initial,
      term,
      searchIn,
      accountType,
      location: location || undefined,
      language: language || undefined,
      repos: (() => {
        if (repos.value === "") return undefined;
        const numeric = toNumber(repos.value);
        return numeric === undefined ? undefined : { operator: repos.operator, value: numeric };
      })(),
      followers: (() => {
        if (followers.value === "") return undefined;
        const numeric = toNumber(followers.value);
        return numeric === undefined
          ? undefined
          : {
              operator: followers.operator,
              value: numeric
            };
      })(),
      created:
        created.value === "" ? undefined : { operator: created.operator, value: created.value },
      sponsorable,
      sort,
      order,
      page: 1
    };
    onSubmit(nextFilters);
  };

  const chips = useMemo(() => {
    const list: { label: string }[] = [];
    if (location) list.push({ label: `Location: ${location}` });
    if (language) list.push({ label: `Language: ${language}` });
    if (repos.value) list.push({ label: `Repos ${repos.operator}${repos.value}` });
    if (followers.value) list.push({ label: `Followers ${followers.operator}${followers.value}` });
    if (created.value) list.push({ label: `Created ${created.operator}${created.value}` });
    if (sponsorable) list.push({ label: "Sponsorable" });
    return list;
  }, [
    created.operator,
    created.value,
    followers.operator,
    followers.value,
    language,
    location,
    repos.operator,
    repos.value,
    sponsorable
  ]);

  const toggleSearchIn = (value: SearchIn) => {
    setSearchIn((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Box className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
        <Typography variant="subtitle2" className="text-slate-600 dark:text-slate-300">
          Query & Sort
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
            label="Search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="login, name or email"
            sx={inputBorderSx}
          />
          <FormControl sx={inputBorderSx}>
            <InputLabel id="search-sort">Sort</InputLabel>
            <Select
              data-cy="sort-select"
              className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
              labelId="search-sort"
              id="search-sort"
              value={sort}
              label="Sort"
              onChange={(e) => setSort(e.target.value as SearchSort)}
              sx={inputBorderSx}
              MenuProps={{ disablePortal: true }}
            >
              {sortOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} data-cy={`sort-${opt.value}`}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={inputBorderSx}>
            <InputLabel id="search-order">Order</InputLabel>
            <Select
              className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
              labelId="search-order"
              value={order}
              label="Order"
              onChange={(e) => setOrder(e.target.value as SearchOrder)}
              sx={inputBorderSx}
              MenuProps={{ disablePortal: true }}
            >
              <MenuItem value="desc">Desc</MenuItem>
              <MenuItem value="asc">Asc</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={inputBorderSx}>
            <InputLabel id="account-type">Type</InputLabel>
            <Select
              className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
              labelId="account-type"
              value={accountType ?? ""}
              label="Type"
              onChange={(e) =>
                setAccountType((e.target.value || undefined) as AccountType | undefined)
              }
              sx={inputBorderSx}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="org">Organization</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Box>

      <Box className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
        <Typography variant="subtitle2" className="text-slate-600 dark:text-slate-300">
          Filters
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={inputBorderSx}
          />
          <TextField
            className="rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-center"
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            sx={inputBorderSx}
          />
          <NumericField
            label="Repositories"
            value={repos.value}
            operator={repos.operator}
            onChange={(value, operator) => setRepos({ value, operator })}
          />
          <NumericField
            label="Followers"
            value={followers.value}
            operator={followers.operator}
            onChange={(value, operator) => setFollowers({ value, operator })}
          />
          <NumericField
            label="Created"
            value={created.value}
            operator={created.operator}
            type="date"
            onChange={(value, operator) => setCreated({ value, operator })}
          />
        </div>
      </Box>

      <Box className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
        <Typography variant="subtitle2" className="text-slate-600 dark:text-slate-300">
          Toggles
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" className="flex-wrap">
          <Stack direction="row" spacing={2} className="flex-wrap">
            {searchInOptions.map((opt) => (
              <FormControlLabel
                key={opt}
                control={
                  <Switch
                    checked={searchIn.includes(opt)}
                    onChange={() => toggleSearchIn(opt)}
                    size="small"
                  />
                }
                label={`in:${opt}`}
              />
            ))}
          </Stack>
          <FormControlLabel
            control={
              <Switch checked={sponsorable} onChange={(e) => setSponsorable(e.target.checked)} />
            }
            label="Sponsorable"
          />
        </Stack>
      </Box>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          {chips.map((chip) => (
            <Chip key={chip.label} label={chip.label} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 dark:text-slate-300">
        <Button variant="contained" color="primary" type="submit" className="dark:bg-sky-900">
          Search
        </Button>
        <span className="text-sm text-slate-500">Server renders page 1; scroll to load more.</span>
      </div>
    </form>
  );
};

interface NumericFieldProps {
  label: string;
  value: string;
  operator: NumericComparator;
  type?: string;
  onChange: (value: string, operator: NumericComparator) => void;
}

const NumericField = ({ label, value, operator, type = "number", onChange }: NumericFieldProps) => (
  <Box className="flex gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2 items-center">
    <FormControl className="w-28">
      <InputLabel id={`${label}-operator`}>Op</InputLabel>
      <Select
        labelId={`${label}-operator`}
        value={operator}
        label="Operator"
        onChange={(e) => onChange(value, e.target.value as NumericComparator)}
      >
        {comparators.map((comp) => (
          <MenuItem key={comp} value={comp}>
            {comp}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      className=" flex flex-col justify-center p-4"
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value, operator)}
      sx={{ ...inputBorderSx, width: "100%" }}
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
    />
  </Box>
);

export default SearchForm;
