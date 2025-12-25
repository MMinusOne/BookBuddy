import { invoke } from "@tauri-apps/api/core";
import { Book } from "../Book";

export async function morphBook({ newBook }: { newBook: Book }) {
  await invoke("morph_book", { newBook });
}
