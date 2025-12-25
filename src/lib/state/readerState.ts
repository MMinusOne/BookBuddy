import { create } from "zustand";
import { Book } from "../Book";
import { RefObject } from "react";

interface ReaderState {
  zoom: number;
  setZoom: (zoom: number) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  selectedText: string;
  setSelectedText: (selectedText: string) => void;
  bookData?: Book;
  setBookData: (bookData: Book) => void;
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
  setBookData: (bookData) => set((prev) => ({ ...prev, bookData })),
  loading: true,
  setLoading: (loading) => set((prev) => ({ ...prev, loading })),
}));
