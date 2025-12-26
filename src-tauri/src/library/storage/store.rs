use super::models::{book::Book, date::Date};
use chrono::Datelike;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Store {
    theme: String,
    hours_read_this_week: [u8; 7],
    average_hours_this_month: u16,
    most_active_day: Date,
    books: Vec<Book>,
}

impl Store {
    pub fn new() -> Self {
        let now = chrono::Utc::now();
        Self {
            theme: String::from("dark"),
            hours_read_this_week: [0; 7],
            average_hours_this_month: 0,
            most_active_day: Date {
                day: now.day(),
                month: now.month(),
                year: now.year(),
            },
            books: Vec::new(),
        }
    }

    pub fn get_books(&self) -> Vec<Book> {
        self.books.clone()
    }
    pub fn get_book(&self, book_id: &str) -> Option<&Book> {
        self.books.iter().find(|book| book.id == book_id)
    }
    pub fn get_theme(&self) -> &String {
        &self.theme
    }
    pub fn add_book(&mut self, book: Book) {
        self.books.push(book);
    }
    pub fn delete_book(&mut self, book_id: &str) -> bool {
        if let Some(pos) = self.books.iter().position(|b| b.id == book_id) {
            self.books.remove(pos);
            true
        } else {
            false
        }
    }
    pub fn get_book_mut(&mut self, book_id: &str) -> Option<&mut Book> {
        self.books.iter_mut().find(|book| book.id == book_id)
    }
    pub fn set_theme(&mut self, theme: String) {
        self.theme = theme;
    }
}
