import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "../features/search/searchSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      search: searchReducer
    },
    devTools: process.env.NODE_ENV !== "production"
  });

const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;

export default store;
