import { create } from "zustand";
import { Book } from "../Book";

export enum Page {
  Home,
  CurrentBooks,
  CompletedBooks,
  PendingBooks,
  FavouriteBooks,
  BookStatistics,
  ReaderView,
}

interface PageState {
  page: Page;
  setPage: (page: Page) => void;
  setCurrentBook: (book: Book) => void;
}

const usePage = create<PageState>((set) => ({
  page: Page.Home,
  setPage: (page) => set((prev) => ({ ...prev, page })),
  currentBook: Book,
  setCurrentBook: (book) => set((prev) => ({ ...prev, book })),
}));

export default usePage;
