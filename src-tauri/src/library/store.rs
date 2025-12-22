use crate::library::date::Date;
use crate::{library::date, APP_INSTANCE};
use chrono::prelude::*;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::os::windows::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};
use std::{error::Error, sync::Mutex};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Store {
    theme: String,
    hours_read_this_week: [u8; 7],
    average_hours_this_month: u16,
    most_active_day: date::Date,
    books: Vec<Book>,
}

static STORE_INSTANCE: OnceCell<Mutex<Store>> = OnceCell::new();
impl Store {
    const STORE_FILE_NAME: &'static str = "store.json";

    pub fn set_theme(&mut self, theme: String) {
        self.theme = theme;
        self.save().unwrap();
    }
    pub fn get_theme(&self) -> &String {
        &self.theme
    }
    pub fn add_book(&mut self, book: Book) {
        self.books.push(book);
        self.save().unwrap();
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

    pub fn save(&self) -> Result<(), Box<dyn Error>> {
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

            *self = file_json;
        }

        Ok(())
    }

    fn new() -> Self {
        let now = Utc::now();

        let mut store = Self {
            theme: String::from("dark"),
            average_hours_this_month: 0,
            hours_read_this_week: [0; 7],
            most_active_day: Date {
                day: now.day(),
                month: now.month(),
                year: now.year(),
            },
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
    pub page_count: u16,
    pub progress: f32,
    pub score: Option<f32>,
    pub is_favourte: bool,
    pub is_open: bool,
    pub time_spent: Duration,
    pub completed_at: Option<SystemTime>,
    pub last_time_opened: Option<SystemTime>,
    pub text_highlights: Vec<TextHighlight>,
    pub file_size: u64,
}

impl Book {
    fn init_copy<P>(&self, book_path: P) -> Result<(), Box<dyn Error>>
    where
        P: AsRef<Path>,
    {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let books_path = app_data_dir.join("books");
        std::fs::create_dir_all(&books_path)?;
        let mut book_dir = books_path.join(&self.id);
        book_dir.set_extension("pdf");
        std::fs::copy(&book_path, &book_dir)?;
        Ok(())
    }
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
pub async fn get_books(book_ids: Vec<String>) -> Result<Vec<Book>, tauri::Error> {
    let books = STORE_INSTANCE.get().unwrap().lock().unwrap().get_books();
    Ok(books)
}

#[tauri::command]
pub async fn get_book(book_id: String) -> Result<Book, tauri::Error> {
    let book = Store::instance()
        .lock()
        .unwrap()
        .get_book(&book_id)
        .unwrap()
        .clone();
    Ok(book)
}

#[tauri::command]
pub async fn get_theme() -> Result<String, tauri::Error> {
    let theme = Store::instance().lock().unwrap().get_theme().clone();
    Ok(theme)
}

#[tauri::command]
pub async fn set_theme(theme: String) -> Result<(), tauri::Error> {
    let mut store = Store::instance().lock().unwrap();
    store.set_theme(theme);
    Ok(())
}

#[tauri::command]
pub async fn load_book_path(book_path: PathBuf) -> Result<(), tauri::Error> {
    let mut store = Store::instance().lock().unwrap();
    let metadata = std::fs::metadata(&book_path).unwrap();
    let file_stem = book_path.file_stem().unwrap();

    let book = Book {
        id: uuid::Uuid::new_v4().to_string(),
        name: String::from(file_stem.to_str().unwrap()),
        description: String::new(),
        page: 0,
        page_count: 0,
        progress: 0f32,
        score: None,
        is_favourte: false,
        is_open: false,
        time_spent: Duration::new(0, 0),
        completed_at: None,
        last_time_opened: None,
        text_highlights: Vec::new(),
        file_size: metadata.file_size(),
    };

    book.init_copy(book_path).unwrap();

    store.add_book(book);

    Ok(())
}

#[tauri::command]
pub async fn morph_book(new_book: Book) -> Result<(), tauri::Error> {
    let mut store = Store::instance().lock().unwrap();
    let old_book = store.get_book_mut(&new_book.id).unwrap();
    *old_book = new_book;
    Ok(())
}
