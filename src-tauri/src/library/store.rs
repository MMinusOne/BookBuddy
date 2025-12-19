use crate::APP_INSTANCE;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::time::Duration;
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
    pub fn add_book(&mut self, book: Book) {
        self.books.push(book);
    }
    pub fn delete_books(&mut self) {}
    pub fn get_books(&self) -> Vec<Book> {
        self.books.clone()
    }
    pub fn get_book(&self, book_id: &str) -> Option<&Book> {
        for book in &self.books {
            if book.id == book_id {
                return Some(book);
            }
        }

        None
    }
    pub fn get_book_mut(&mut self, book_id: &str) -> Option<&mut Book> {
        for book in &mut self.books {
            if book.id == book_id {
                return Some(book);
            }
        }

        None
    }

    fn save(&self) -> Result<(), Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);
        let mut file = File::create(app_data_dir.join(&store_path))?;
        let store_data_str = serde_json::to_string(&self)?;
        let serialized_store = store_data_str.as_bytes();
        file.write(serialized_store)?;
        Ok(())
    }

    fn init(&mut self) -> Result<(), Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);

        if !std::fs::exists(&store_path)? {
            self.save()?;
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

        store.init().unwrap();

        store
    }
    pub fn instance() -> &'static Mutex<Self> {
        STORE_INSTANCE.get_or_init(|| Mutex::new(Self::new()))
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Book {
    pub id: String,
    pub name: String,
    pub description: String,
    pub page: u16,
    pub progress: f32,
    pub score: Option<f32>,
    pub is_favourte: bool,
    pub is_open: bool,
    pub time_spent: Duration,
    pub text_highlights: Vec<TextHighlight>,
    pub path: PathBuf,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TextHighlight {
    pub page_number: u16,
    pub line_number: u16,
    pub start_pos: u16,
    pub length: u16,
    pub color: TextHighlightColor,
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

#[tauri::command]
pub async fn get_books(book_ids: Vec<String>) -> Result<Vec<Book>, String> {
    let books = STORE_INSTANCE.get().unwrap().lock().unwrap().get_books();
    Ok(books)
}

#[tauri::command]
pub async fn get_book(book_id: String) -> Result<Book, String> {
    let book = STORE_INSTANCE
        .get()
        .unwrap()
        .lock()
        .unwrap()
        .get_book(&book_id)
        .unwrap()
        .clone();
    Ok(book)
}

#[tauri::command]
pub async fn get_theme() -> Result<String, String> {
    let theme = STORE_INSTANCE
        .get()
        .unwrap()
        .lock()
        .unwrap()
        .get_theme()
        .clone();
    Ok(theme)
}

#[tauri::command]
pub async fn set_theme(theme: String) -> Result<(), String> {
    let store = STORE_INSTANCE.get().unwrap();
    let mut store = store.lock().unwrap();
    store.set_theme(theme);
    Ok(())
}

#[tauri::command]
pub async fn load_book_directory(path: String) -> Result<(), String> {
    use walkdir::WalkDir;
    let store = STORE_INSTANCE.get().unwrap();
    let mut store = store.lock().unwrap();

    for entry in WalkDir::new(path).into_iter().filter_map(Result::ok) {
        if entry.file_type().is_file() && entry.path().extension().unwrap() == "pdf" {
            let book = Book {
                id: uuid::Uuid::new_v4().to_string(),
                name: entry.file_name().to_str().unwrap().to_string(),
                description: String::new(),
                is_favourte: false,
                is_open: false,
                progress: 0f32,
                page: 0u16,
                time_spent: Duration::new(0, 0),
                score: None,
                path: entry.path().to_path_buf(),
                text_highlights: Vec::new(),
            };
            store.add_book(book);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn morph_book(new_book: Book) -> Result<(), String> {
    let store = STORE_INSTANCE.get().unwrap();
    let mut store = store.lock().unwrap();
    let old_book = store.get_book_mut(&new_book.id).unwrap();
    *old_book = new_book;
    Ok(())
}
