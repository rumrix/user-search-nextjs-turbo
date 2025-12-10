const DEFAULT_PER_PAGE = 20;
const comparatorValue = (filter) => filter?.value !== undefined && filter.value !== null && filter.value !== Number.NaN;
const applyNumeric = (key, filter) => {
    if (!filter || !comparatorValue(filter)) {
        return "";
    }
    const operator = filter.operator ?? ">=";
    return `${key}:${operator}${filter.value}`;
};
const sanitize = (value) => value?.trim() ?? "";
export const buildSearchQuery = (filters) => {
    const parts = [];
    const term = sanitize(filters.term) || "*";
    parts.push(term);
    if (filters.searchIn && filters.searchIn.length > 0) {
        parts.push(`in:${filters.searchIn.join(",")}`);
    }
    if (filters.accountType) {
        parts.push(`type:${filters.accountType}`);
    }
    if (filters.location) {
        parts.push(`location:${filters.location.trim()}`);
    }
    if (filters.language) {
        parts.push(`language:${filters.language.trim()}`);
    }
    const reposQualifier = applyNumeric("repos", filters.repos);
    if (reposQualifier)
        parts.push(reposQualifier);
    const followersQualifier = applyNumeric("followers", filters.followers);
    if (followersQualifier)
        parts.push(followersQualifier);
    const createdQualifier = applyNumeric("created", filters.created);
    if (createdQualifier)
        parts.push(createdQualifier);
    if (filters.sponsorable) {
        parts.push("is:sponsorable");
    }
    return parts.filter(Boolean).join(" ");
};
export const mapSortToApi = (sort) => {
    if (!sort || sort === "best")
        return undefined;
    if (sort === "followers")
        return "followers";
    if (sort === "repositories")
        return "repositories";
    if (sort === "joined")
        return "joined";
    return undefined;
};
export const normalizeOrder = (order) => order ?? "desc";
export const buildSearchParams = (filters) => {
    const params = new URLSearchParams();
    params.set("q", buildSearchQuery(filters));
    const mappedSort = mapSortToApi(filters.sort);
    if (mappedSort) {
        params.set("sort", mappedSort);
        params.set("order", normalizeOrder(filters.order));
    }
    params.set("page", String(filters.page ?? 1));
    params.set("per_page", String(filters.perPage ?? DEFAULT_PER_PAGE));
    return params;
};
export const dedupeUsersByLogin = (items) => {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        if (seen.has(item.login))
            continue;
        seen.add(item.login);
        result.push(item);
    }
    return result;
};
export const getNextPage = (currentPage, perPage, total) => {
    const maxPage = Math.ceil(total / perPage);
    const next = currentPage + 1;
    return next <= maxPage ? next : null;
};
export const buildAvatarProxyUrl = (avatarUrl, basePath = "/api/avatar-proxy") => {
    const url = new URL(basePath, "http://localhost");
    url.searchParams.set("src", avatarUrl);
    return url.pathname + url.search;
};
