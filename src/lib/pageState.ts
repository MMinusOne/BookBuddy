import { create } from "zustand";

export enum Page {
  Home,
  CurrentBooks,
  CompletedBooks,
  PendingBooks,
  FavouriteBooks,
  BookStatistics,
}

interface PageState {
  page: Page;
  setPage: (page: Page) => void;
}

const usePage = create<PageState>((set) => ({
  page: Page.Home,
  setPage: (page) => set((prev) => ({ ...prev, page })),
}));

export default usePage;
