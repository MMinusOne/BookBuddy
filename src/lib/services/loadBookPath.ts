import { invoke } from "@tauri-apps/api/core";

export async function loadBookPath({ bookPath }: { bookPath: string }) {
  await invoke("load_book_path", { bookPath });
}
