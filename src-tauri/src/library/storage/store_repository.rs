use crate::{library::storage::store::Store, APP_INSTANCE};
use anyhow::anyhow;
use std::io::Write;
use std::{
    error::Error,
    fs::File,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

pub struct StorageRepository {
    app_handle: AppHandle,
}

impl StorageRepository {
    const STORE_FILE_NAME: &'static str = "store.json";

    pub fn load(&self) -> Result<Store, Box<dyn Error>> {
        let app_data_dir = self.app_handle.path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);
        let file_contents = std::fs::read(store_path)?;
        let store: Store = serde_json::from_slice(&file_contents)?;
        Ok(store)
    }

    pub fn save(&self, store: &Store) -> Result<(), Box<dyn Error>> {
        let app_data_dir = self.app_handle.path().app_data_dir()?;
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);
        let mut file = File::create(&store_path)?;
        let store_data_str = serde_json::to_string(&store)?;
        let serialized_store = store_data_str.as_bytes();
        file.write(serialized_store)?;
        file.flush()?;
        Ok(())
    }

    pub fn copy_book_file(
        &self,
        book_id: &str,
        source_path: &Path,
    ) -> Result<PathBuf, Box<dyn Error>> {
        let books_dir = self.get_books_directory()?;
        std::fs::create_dir_all(&books_dir)?;
        let mut copied_book_path = books_dir.join(&book_id);
        copied_book_path.set_extension("pdf");
        std::fs::copy(&source_path, &copied_book_path)?;
        Ok(copied_book_path)
    }

    pub fn delete_book_file(&self, book_path: &Path) -> Result<(), Box<dyn Error>> {
        Ok(std::fs::remove_file(book_path)?)
    }

    pub fn get_books_directory(&self) -> Result<PathBuf, Box<dyn Error>> {
        let app_data_dir = self
            .app_handle
            .path()
            .app_data_dir()
            .map_err(|e| tauri::Error::from(anyhow!(e)))?;
        let books_dir = app_data_dir.join("books");
        Ok(books_dir)
    }

    fn init() {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir().unwrap();
        let store_path = app_data_dir.join(Self::STORE_FILE_NAME);
        let store_exists = std::fs::exists(&store_path).unwrap();

        if !store_exists {
            let store = Store::new();
            let store_data_str = serde_json::to_string(&store).unwrap();
            let store_data_bytes = store_data_str.as_bytes();
            std::fs::write(&store_path, store_data_bytes).unwrap();
        }
    }

    pub fn new() -> Self {
        let app_handle = APP_INSTANCE.get().unwrap().clone();

        Self::init();

        Self { app_handle }
    }
}
