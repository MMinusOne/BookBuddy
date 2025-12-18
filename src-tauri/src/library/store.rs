use crate::APP_INSTANCE;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::{collections::HashMap, error::Error, sync::Mutex};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Store {
    theme: String,
    books: Vec<Book>,
}

static STORE_INSTANCE: OnceCell<Mutex<Store>> = OnceCell::new();

impl Store {
    const STORE_FILE_NAME: &'static str = "store.json";

    pub fn set_theme(&mut self, theme: String) {
        self.theme = theme;
    }
    pub fn get_theme(&self) -> &String {
        &self.theme
    }
    pub fn add_books(&mut self, book: Book) {
        self.books.push(book);
    }
    pub fn delete_books(&mut self) {}
    pub fn get_books(&self) -> Vec<Book> {
        self.books.clone()
    }
    pub fn get_book(&self, book_id: String) -> Option<&Book> {
        for book in &self.books {
            if book.id == book_id {
                return Some(book);
            }
        }

        None
    }
    pub fn add_favourites(&mut self, book_ids: Vec<String>) {
        for book in &mut self.books {
            for book_id in &book_ids {
                if book_id == &book.id {
                    book.is_favourte = true;
                    break;
                }
            }
        }
    }
    pub fn remove_favourites(&mut self, book_ids: Vec<String>) {
        for book in &mut self.books {
            for book_id in &book_ids {
                if book_id == &book.id {
                    book.is_favourte = false;
                    break;
                }
            }
        }
    }
    pub fn add_text_highlights(&mut self, book_id: String, text_highlights: Vec<TextHighlight>) {
        for book in &mut self.books {
            if book_id == book_id {
                book.text_highlights.extend(text_highlights);
                break;
            }
        }
    }

    fn save(&self) -> Result<(), Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);
        let mut file = File::create(app_data_dir.join(&store_path))?;
        let store_data_str = serde_json::to_string(&self)?;
        let serialized_store = store_data_str.as_bytes();
        file.write(serialized_store);
        Ok(())
    }

    fn init(&mut self) -> Result<(), Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);

        if !std::fs::exists(&store_path)? {
            self.save();
        } else {
            let file_contents = std::fs::read(store_path)?;
            let file_json: Self = serde_json::from_slice(&file_contents)?;

            self.books = file_json.books;
        }

        Ok(())
    }

    fn new() -> Self {
        let mut store = Self {
            theme: String::from("dark"),
            books: Vec::new(),
        };

        store.init();

        store
    }
    pub fn instance() -> &'static Mutex<Self> {
        STORE_INSTANCE.get_or_init(|| Mutex::new(Self::new()))
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Book {
    id: String,
    name: String,
    description: String,
    is_favourte: bool,
    progress: f32,
    time_spent: f32,
    text_highlights: Vec<TextHighlight>,
    path: PathBuf,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TextHighlight {
    page_number: u16,
    line_number: u16,
    start_pos: u16,
    length: u16,
    color: TextHighlightColor,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum TextHighlightColor {
    RED,
    BLUE,
    CYAN,
    GREEN,
    GRAY,
    PINK,
    YELLOW,
    PURPLE,
}
