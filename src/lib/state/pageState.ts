import { create } from "zustand";
import { Book } from "../Book";

export enum Page {
  Home,
  CurrentBooks,
  CompletedBooks,
  PendingBooks,
  FavouriteBooks,
  BookStatistics,
  Reader,
}

interface PageState {
  page: Page;
  setPage: (page: Page) => void;
  currentBook?: Book;
  setCurrentBook: (book: Book) => void;
}

const usePage = create<PageState>((set) => ({
  page: Page.Home,
  setPage: (page) => set((prev) => ({ ...prev, page })),
  currentBook: undefined,
  setCurrentBook: (currentBook) => set((prev) => ({ ...prev, currentBook })),
}));

export default usePage;
