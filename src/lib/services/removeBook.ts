import { invoke } from "@tauri-apps/api/core";

export async function deleteBook(bookId: String) {
  await invoke("delete_book", { bookId });
}
