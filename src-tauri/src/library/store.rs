use crate::library::bookmetadata_factory::BookMetadataFactory;
use crate::library::date::Date;
use crate::{library::date, APP_INSTANCE};
use anyhow::anyhow;
use chrono::prelude::*;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs::File;
use std::io::Write;
use std::os::windows::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, SystemTime};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
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
    }
    pub fn get_theme(&self) -> &String {
        &self.theme
    }
    pub fn add_book(&mut self, book: Book) {
        println!("Added book {:#?}", &book);
        self.books.push(book);
    }
    pub fn delete_book(&mut self, book_id: &String) {
        for (book_index, book) in self.books.iter().enumerate() {
            if book.id == *book_id {
                self.books.remove(book_index);
                break;
            }
        }
    }
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Book {
    pub id: String,
    pub name: String,
    pub description: String,
    pub current_page: u16,
    pub page_count: usize,
    pub score: Option<f32>,
    pub is_favorite: bool,
    pub is_open: bool,
    pub time_spent: Duration,
    pub completed_at: Option<SystemTime>,
    pub last_time_opened: Option<SystemTime>,
    pub text_highlights: Vec<TextHighlight>,
    pub file_size: u64,
    pub book_path: PathBuf,
    pub thumbnail_path: PathBuf,
}

impl Book {
    fn init_copy<P>(&self, book_path: P) -> Result<PathBuf, Box<dyn Error>>
    where
        P: AsRef<Path>,
    {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let books_dir = app_data_dir.join("books");
        std::fs::create_dir_all(&books_dir)?;
        let mut copied_book_path = books_dir.join(&self.id);
        copied_book_path.set_extension("pdf");
        std::fs::copy(&book_path, &copied_book_path)?;
        Ok(copied_book_path)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextHighlight {
    pub page_number: u16,
    pub line_number: u16,
    pub start_pos: u16,
    pub length: u16,
    pub color: TextHighlightColor,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
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
pub async fn get_books() -> Result<Vec<Book>, tauri::Error> {
    let books = Store::instance().lock().unwrap().get_books();
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
    let mut store = Store::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;

    store.set_theme(theme);

    store
        .save()
        .map_err(|e| tauri::Error::from(anyhow!("Save error: {}", e)))
}

#[tauri::command]
pub async fn load_book_paths(book_paths: Vec<PathBuf>) -> Result<(), tauri::Error> {
    let mut books_to_add: Vec<Book> = Vec::new();

    let futures: Vec<_> = book_paths
        .into_iter()
        .map(|book_path| {
            tokio::spawn(async move {
                let metadata = std::fs::metadata(&book_path).unwrap();
                let file_stem = book_path.file_stem().unwrap();

                let book_id = uuid::Uuid::new_v4().to_string();

                let mut book = Book {
                    id: book_id.clone(),
                    name: String::from(file_stem.to_str().unwrap()),
                    description: String::new(),
                    current_page: 0,
                    page_count: 0,
                    score: None,
                    is_favorite: false,
                    is_open: false,
                    time_spent: Duration::new(0, 0),
                    completed_at: None,
                    last_time_opened: None,
                    text_highlights: Vec::new(),
                    file_size: metadata.file_size(),
                    book_path: PathBuf::new(),
                    thumbnail_path: PathBuf::new(),
                };

                let copied_book_path = book.init_copy(&book_path).unwrap();
                let book_metadata =
                    BookMetadataFactory::metadata_from(&copied_book_path, &book_id).unwrap();

                book.book_path = copied_book_path;
                book.thumbnail_path = book_metadata.thumbnail_path;
                book.page_count = book_metadata.page_count;
                book
            })
        })
        .collect();

    for future in futures {
        books_to_add.push(
            future
                .await
                .map_err(|e| tauri::Error::from(anyhow!("Save error: {}", e)))?,
        );
    }

    let mut store = Store::instance().lock().unwrap();

    for book in books_to_add {
        store.add_book(book);
        store
            .save()
            .map_err(|e| tauri::Error::from(anyhow!("Save error: {}", e)))?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_book(book_id: String) -> Result<(), tauri::Error> {
    let mut store = Store::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;
    let book = store.get_book(&book_id).unwrap();
    std::fs::remove_file(&book.book_path).unwrap();
    store.delete_book(&book_id);
    store
        .save()
        .map_err(|e| tauri::Error::from(anyhow!("Save error: {}", e)))
}

#[tauri::command]
pub async fn morph_book(new_book: Book) -> Result<(), tauri::Error> {
    let mut store = Store::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;
    let old_book = store.get_book_mut(&new_book.id).unwrap();
    *old_book = new_book;
    store.save().unwrap();
    Ok(())
}
