import { create } from "zustand";
import { BookData } from "../Book";
import { morphBook } from "../services/morphBook";

interface ReaderState {
  zoom: number;
  setZoom: (zoom: number) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  selectedText: string;
  setSelectedText: (selectedText: string) => void;
  bookData?: BookData;
  setBookData: (bookData: BookData) => void;
  setBookCurrentPage: (pageNumber: number) => void;
  setBookIsOpen: (is_open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useReaderState = create<ReaderState>((set) => ({
  zoom: 100,
  setZoom: (zoom) => set((prev) => ({ ...prev, zoom })),
  startTime: new Date(),
  setStartTime: (startTime) => set((prev) => ({ ...prev, startTime })),
  selectedText: "",
  setSelectedText: (selectedText) => set((prev) => ({ ...prev, selectedText })),
  bookData: undefined,
  setBookData: (bookData) =>
    set((prev) => {
      (async () => {
        await morphBook({ newBook: bookData });
      })();
      return { ...prev, bookData };
    }),
  setBookCurrentPage: (pageNumber: number) =>
    set((prev) => {
      if (prev.bookData) {
        const updatedBookData = {
          ...prev.bookData,
          current_page: pageNumber,
        };

        (async () => {
          await morphBook({ newBook: updatedBookData });
        })();

        return { ...prev, bookData: updatedBookData };
      }
      return prev;
    }),
  setBookIsOpen: (is_open: boolean) =>
    set((prev) => {
      if (prev.bookData) {
        const updatedBookData = {
          ...prev.bookData,
          is_open,
        };

        (async () => {
          await morphBook({ newBook: updatedBookData });
        })();

        return { ...prev, bookData: updatedBookData };
      }
      return prev;
    }),
  loading: true,
  setLoading: (loading) => set((prev) => ({ ...prev, loading })),
}));
