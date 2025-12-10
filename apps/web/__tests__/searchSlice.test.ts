import { SearchFilters } from "@user-search/core";
import { fetchNextPage, hydrateFromServer } from "../features/search/searchSlice";
import { makeStore } from "../store/store";

const mockFetch = (payload: any, ok = true) =>
  jest.fn().mockResolvedValue({
    ok,
    json: async () => payload
  } as any);

describe("search slice", () => {
  it("hydrates from server and appends without duplicates", async () => {
    const store = makeStore();
    const filters: SearchFilters = { term: "john", page: 1, perPage: 2, sort: "best", order: "desc" };

    store.dispatch(
      hydrateFromServer({
        filters,
        queryKey: "q1",
        response: {
          items: [
            { login: "a", id: 1, avatarUrl: "", htmlUrl: "", type: "User", score: 1 },
            { login: "b", id: 2, avatarUrl: "", htmlUrl: "", type: "User", score: 1 }
          ],
          totalCount: 3,
          hasMore: true,
          page: 1,
          perPage: 2
        }
      })
    );

    global.fetch = mockFetch({
      items: [
        { login: "b", id: 2, avatarUrl: "", htmlUrl: "", type: "User", score: 1 },
        { login: "c", id: 3, avatarUrl: "", htmlUrl: "", type: "User", score: 1 }
      ],
      totalCount: 3,
      hasMore: false,
      page: 2,
      perPage: 2
    }) as any;

    await store.dispatch(fetchNextPage());
    const state = store.getState().search;
    expect(state.items.map((i) => i.login)).toEqual(["a", "b", "c"]);
    expect(state.hasMore).toBe(false);
  });
});
