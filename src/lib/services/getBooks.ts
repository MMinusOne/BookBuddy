import { invoke } from "@tauri-apps/api/core";
import { Book, BookData } from "../Book";
import { useEffect, useState } from "react";

export async function getBooks(): Promise<Book[]> {
  const bookDatas = await invoke<BookData[]>("get_books");
  const books = [];

  for (const bookData of bookDatas) {
    books.push(new Book(bookData));
  }
  return books;
}

export function useGetBooks(): Book[] {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    (async () => {
      setBooks(await getBooks());
    })();
  }, []);

  return books;
}
