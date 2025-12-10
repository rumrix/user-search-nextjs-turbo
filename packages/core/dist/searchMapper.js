import { dedupeUsersByLogin, getNextPage } from "./githubQueryBuilder";
export const mapGithubUser = (user) => ({
    login: user.login,
    id: user.id,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    type: user.type,
    score: user.score
});
export const mapSearchResponse = (payload, page, perPage, rateLimit) => {
    const items = dedupeUsersByLogin(payload.items.map(mapGithubUser));
    const nextPage = getNextPage(page, perPage, payload.total_count);
    return {
        totalCount: payload.total_count,
        hasMore: Boolean(nextPage),
        items,
        rateLimit
    };
};
