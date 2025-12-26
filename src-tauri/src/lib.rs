mod library;
use library::commands;
use once_cell::sync::OnceCell;
use tauri::{AppHandle, Manager};

pub static APP_INSTANCE: OnceCell<AppHandle> = OnceCell::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.app_handle();
            APP_INSTANCE.get_or_init(|| app_handle.clone());
            let app_data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_data_dir)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::book_commands::get_books,
            commands::book_commands::get_book,
            commands::book_commands::get_theme,
            commands::book_commands::set_theme,
            commands::book_commands::load_book_paths,
            commands::book_commands::delete_book,
            commands::book_commands::morph_book,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
