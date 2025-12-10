import { AccountType, SearchFilters, SearchIn, SearchOrder, SearchSort } from "@user-search/core";
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField
} from "@mui/material";
import { useMemo, useState } from "react";

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
const comparators = [">=", ">", "<=", "<", "="];

const SearchForm = ({ initial, onSubmit }: Props) => {
  const [term, setTerm] = useState(initial.term ?? "");
  const [searchIn, setSearchIn] = useState<SearchIn[]>(initial.searchIn ?? ["login", "name"]);
  const [accountType, setAccountType] = useState<AccountType | undefined>(initial.accountType);
  const [location, setLocation] = useState(initial.location ?? "");
  const [language, setLanguage] = useState(initial.language ?? "");
  const [repos, setRepos] = useState({
    operator: initial.repos?.operator ?? ">=",
    value: initial.repos?.value ? String(initial.repos.value) : ""
  });
  const [followers, setFollowers] = useState({
    operator: initial.followers?.operator ?? ">=",
    value: initial.followers?.value ? String(initial.followers.value) : ""
  });
  const [created, setCreated] = useState({
    operator: initial.created?.operator ?? ">=",
    value: initial.created?.value ? String(initial.created.value) : ""
  });
  const [sponsorable, setSponsorable] = useState(Boolean(initial.sponsorable));
  const [sort, setSort] = useState<SearchSort>(initial.sort ?? "best");
  const [order, setOrder] = useState<SearchOrder>(initial.order ?? "desc");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextFilters: SearchFilters = {
      ...initial,
      term,
      searchIn,
      accountType,
      location: location || undefined,
      language: language || undefined,
      repos:
        repos.value === ""
          ? undefined
          : { operator: repos.operator as any, value: Number(repos.value) || repos.value },
      followers:
        followers.value === ""
          ? undefined
          : {
              operator: followers.operator as any,
              value: Number(followers.value) || followers.value
            },
      created:
        created.value === ""
          ? undefined
          : { operator: created.operator as any, value: created.value },
      sponsorable,
      sort,
      order,
      page: 1
    };
    onSubmit(nextFilters);
  };

  const chips = useMemo(
    () =>
      [
        location && { label: `Location: ${location}` },
        language && { label: `Language: ${language}` },
        repos.value && { label: `Repos ${repos.operator}${repos.value}` },
        followers.value && { label: `Followers ${followers.operator}${followers.value}` },
        created.value && { label: `Created ${created.operator}${created.value}` },
        sponsorable && { label: "Sponsorable" }
      ].filter(Boolean),
    [
      created.operator,
      created.value,
      followers.operator,
      followers.value,
      language,
      location,
      repos.operator,
      repos.value,
      sponsorable
    ]
  );

  const toggleSearchIn = (value: SearchIn) => {
    setSearchIn((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2 p-2"
          label="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="login, name or email"
          fullWidth
          variant="standard"
        />
        <FormControl fullWidth>
          <InputLabel id="search-sort">Sort</InputLabel>
          <Select
            className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
            labelId="search-sort"
            id="search-sort"
            value={sort}
            label="Sort"
            onChange={(e) => setSort(e.target.value as SearchSort)}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="search-order">Order</InputLabel>
          <Select
            className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
            labelId="search-order"
            value={order}
            label="Order"
            onChange={(e) => setOrder(e.target.value as SearchOrder)}
          >
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="account-type">Type</InputLabel>
          <Select
            className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
            labelId="account-type"
            value={accountType ?? ""}
            label="Type"
            onChange={(e) =>
              setAccountType((e.target.value || undefined) as AccountType | undefined)
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="org">Organization</MenuItem>
          </Select>
        </FormControl>
        <TextField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2 p-2"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          variant="standard"
        />
        <TextField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2 p-2"
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
        />
        <NumericField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
          label="Repositories"
          value={repos.value}
          operator={repos.operator}
          onChange={(value, operator) => setRepos({ value, operator })}
        />
        <NumericField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
          label="Followers"
          value={followers.value}
          operator={followers.operator}
          onChange={(value, operator) => setFollowers({ value, operator })}
        />
        <NumericField
          className="rounded-lg border border-slate-400 dark:border-slate-100 m-2"
          label="Created"
          value={created.value}
          operator={created.operator}
          type="date"
          onChange={(value, operator) => setCreated({ value, operator })}
        />
        <Stack direction="row" spacing={2} alignItems="center" className="md:col-span-2">
          <Stack direction="row" spacing={2}>
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
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, idx) => (
            <Chip key={idx} label={(chip as any).label} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button variant="contained" color="primary" type="submit">
          Search
        </Button>
        <span className="text-sm text-slate-500">Server renders page 1; scroll to load more.</span>
      </div>
    </form>
  );
};

interface NumericFieldProps {
  className: string;
  label: string;
  value: string;
  operator: string;
  type?: string;
  onChange: (value: string, operator: string) => void;
}

const NumericField = ({
  className,
  label,
  value,
  operator,
  type = "number",
  onChange
}: NumericFieldProps) => (
  <div className={`flex gap-2 items-center ${className}`}>
    <FormControl className="w-28">
      <InputLabel id={`${label}-operator`}>Op</InputLabel>
      <Select
        labelId={`${label}-operator`}
        value={operator}
        label="Operator"
        onChange={(e) => onChange(value, e.target.value)}
      >
        {comparators.map((comp) => (
          <MenuItem key={comp} value={comp}>
            {comp}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value, operator)}
      className="flex-1 m-2 p-2"
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
    />
  </div>
);

export default SearchForm;
