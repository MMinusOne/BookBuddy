import { invoke } from "@tauri-apps/api/core";
import { BookData } from "../Book";

export async function morphBook({ newBook }: { newBook: BookData }) {
  await invoke("morph_book", { newBook });
}
