use std::{
    path::PathBuf,
    time::{Duration, SystemTime},
};
use serde::{Deserialize, Serialize};

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

impl Book {}

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
