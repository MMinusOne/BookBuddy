import { invoke } from "@tauri-apps/api/core";

export async function loadBookPaths({ bookPaths }: { bookPaths: string[] }) {
  await invoke("load_book_paths", { bookPaths });
}
