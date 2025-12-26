use std::path::PathBuf;

use anyhow::anyhow;

use crate::library::storage::{book_service::BookService, models::book::Book};

#[tauri::command]
pub fn get_books() -> Result<Vec<Book>, tauri::Error> {
    println!("Getting books");
    let book_service = BookService::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;

    let books = book_service.get_books().to_vec();
    Ok(books)
}

#[tauri::command]
pub fn get_book(book_id: String) -> Result<Book, tauri::Error> {
    println!("Getting book");
    let book_service = BookService::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;

    book_service
        .get_book(&book_id)
        .cloned()
        .ok_or_else(|| tauri::Error::from(anyhow!("Book not found")))
}

#[tauri::command]
pub async fn get_theme() -> Result<String, tauri::Error> {
    println!("Getting theme");
    let theme = BookService::instance().lock().unwrap().get_theme().clone();
    Ok(theme)
}

#[tauri::command]
pub async fn set_theme(theme: String) -> Result<(), tauri::Error> {
    println!("Setting theme");
    let mut book_service = BookService::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;

    book_service
        .set_theme(theme)
        .map_err(|e| tauri::Error::from(anyhow!("Set theme error: {}", e)))?;
    Ok(())
}

#[tauri::command]
pub async fn load_book_paths(book_paths: Vec<PathBuf>) -> Result<(), tauri::Error> {
    println!("Loading book paths");
    let mut book_service = BookService::instance().lock().unwrap();
    book_service.add_books(book_paths).unwrap();
    Ok(())
}

#[tauri::command]
pub fn delete_book(book_id: String) -> Result<(), tauri::Error> {
    println!("Deleting book");
    let mut book_service = BookService::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;
    book_service
        .delete_book(&book_id)
        .map_err(|e| tauri::Error::from(anyhow!("Delete book error: {}", e)))?;
    Ok(())
}

#[tauri::command]
pub async fn morph_book(new_book: Book) -> Result<(), tauri::Error> {
    println!("Morphing book");
    let mut book_service = BookService::instance()
        .lock()
        .map_err(|e| tauri::Error::from(anyhow!("Lock error: {}", e)))?;
    book_service
        .update_book(new_book)
        .map_err(|e| tauri::Error::from(anyhow!("Update book error: {}", e)))?;
    Ok(())
}
