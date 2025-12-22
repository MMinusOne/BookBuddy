use lopdf::Document;
use lopdf::Object;
use pdf_thumb::PdfThumb;
use std::error::Error;
use std::path::PathBuf;
use tauri::Manager;

use crate::APP_INSTANCE;

pub struct BookMetadataFactory;

impl BookMetadataFactory {
    pub fn metadata_from(
        book_path: &PathBuf,
        book_id: &String,
    ) -> Result<BookMetadata, Box<dyn Error>> {
        let extension = book_path.extension().unwrap().to_str().unwrap();
        match extension {
            "pdf" => return Self::metadata_pdf(book_path, book_id),
            _ => unimplemented!(),
        }
    }

    pub fn metadata_pdf(
        pdf_path: &PathBuf,
        book_id: &String,
    ) -> Result<BookMetadata, Box<dyn Error>> {
        let doc = Document::load(&pdf_path).unwrap();
        let pdf = PdfThumb::open(&pdf_path)?;

        let thumb = pdf.thumb()?;

        let thumbnails_dir = Self::get_thumbnails_dir()?;
        let thumbnail_path = thumbnails_dir.join(book_id);

        std::fs::write(thumbnails_dir.join(book_id), &thumb)?;

        let pages = doc.catalog()?.get(b"Pages")?.as_reference()?;
        let pages_dict = doc.get_dictionary(pages)?;

        let num_pages = match pages_dict.get(b"Count")? {
            Object::Integer(n) => *n as usize,
            _ => unimplemented!(),
        };

        Ok(BookMetadata {
            page_count: num_pages,
            thumbnail_path,
        })
    }

    fn get_thumbnails_dir() -> Result<PathBuf, Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        let thumbnails_dir = app_data_dir.join("thumbnails");
        std::fs::create_dir_all(&thumbnails_dir)?;
        Ok(thumbnails_dir)
    }
}

pub struct BookMetadata {
    pub page_count: usize,
    pub thumbnail_path: PathBuf,
}
