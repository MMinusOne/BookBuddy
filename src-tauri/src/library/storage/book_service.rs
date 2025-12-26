use once_cell::sync::OnceCell;

use crate::library::bookmetadata_factory::BookMetadataFactory;
use crate::library::storage::models::book::Book;
use crate::library::storage::store::Store;
use crate::library::storage::store_repository::StorageRepository;
use std::error::Error;
use std::os::windows::fs::MetadataExt;
use std::sync::Mutex;
use std::{path::PathBuf, time::Duration};

pub static BOOK_SERVICE: OnceCell<Mutex<BookService>> = OnceCell::new();

pub struct BookService {
    storage_repository: StorageRepository,
    store: Store,
}

impl BookService {
    pub fn add_books(&mut self, book_paths: Vec<PathBuf>) -> Result<(), Box<dyn Error>> {
        for book_path in &book_paths {
            let metadata = std::fs::metadata(&book_path)?;
            let file_stem = book_path.file_stem().ok_or("Invalid file name")?;

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

            let copied_book_path = self
                .storage_repository
                .copy_book_file(&book_id, &book_path)
                .unwrap();
            let book_metadata = BookMetadataFactory::metadata_from(&copied_book_path, &book_id)?;

            book.book_path = copied_book_path;
            book.thumbnail_path = book_metadata.thumbnail_path;
            book.page_count = book_metadata.page_count;

            self.store.add_book(book);
        }

        self.storage_repository.save(&self.store)?;

        Ok(())
    }

    pub fn delete_book(&mut self, book_id: &str) -> Result<(), Box<dyn Error>> {
        if let Some(book) = self.store.get_book(book_id) {
            let book_path = book.book_path.clone();
            self.storage_repository.delete_book_file(&book_path)?;
            self.store.delete_book(book_id);
            self.storage_repository.save(&self.store)?;
        }
        Ok(())
    }

    pub fn update_book(&mut self, book: Book) -> Result<(), Box<dyn Error>> {
        if let Some(old_book) = self.store.get_book_mut(&book.id) {
            *old_book = book;
            self.storage_repository.save(&self.store)?;
        }
        Ok(())
    }

    pub fn get_book(&self, book_id: &str) -> Option<&Book> {
        self.store.get_book(book_id)
    }

    pub fn get_books(&self) -> Vec<Book> {
        self.store.get_books()
    }

    pub fn set_theme(&mut self, theme: String) -> Result<(), Box<dyn Error>> {
        self.store.set_theme(theme);
        Ok(self.storage_repository.save(&self.store)?)
    }
    pub fn get_theme(&mut self) -> &String {
        self.store.get_theme()
    }

    pub fn new() -> Self {
        let storage_repository = StorageRepository::new();
        let store = storage_repository.load().unwrap();

        Self {
            storage_repository,
            store,
        }
    }

    pub fn instance() -> &'static Mutex<Self> {
        BOOK_SERVICE.get_or_init(|| Mutex::new(Self::new()))
    }
}
