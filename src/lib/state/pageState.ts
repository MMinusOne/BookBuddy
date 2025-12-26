import { create } from "zustand";
import { Book, BookData } from "../Book";

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
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  books: BookData[];
  setBooks: (books: BookData[]) => void;
}

const usePage = create<PageState>((set) => ({
  page: Page.Home,
  setPage: (page) => set((prev) => ({ ...prev, page })),
  isLoading: false,
  setIsLoading: (isLoading) => set((prev) => ({ ...prev, isLoading })),
  books: [],
  setBooks: (books: BookData[]) => set((prev) => ({ ...prev, books })),
}));

export default usePage;
