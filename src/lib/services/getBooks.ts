import { invoke } from "@tauri-apps/api/core";
import { Book } from "../Book";
import { useEffect, useState } from "react";

export async function getBooks(): Promise<Book[]> {
  const books = await invoke<Book[]>("get_books");
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
