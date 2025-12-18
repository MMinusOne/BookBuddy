use once_cell::sync::OnceCell;
use std::{
    collections::HashMap,
    error::Error,
    fs::File,
    io::Write,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::App;

pub struct Settings {
    settings: HashMap<String, String>,
}

static SETTINGS_INSTANCE: OnceCell<Mutex<Settings>> = OnceCell::new();

impl Settings {
    const SETTINGS_FILE_NAME: &'static str = "settings.json";

    fn load_settings(&self) {}

    pub fn initialize<P>(app_data_dir: P) -> Result<(), Box<dyn Error>>
    where
        P: AsRef<Path>,
    {
        let path = app_data_dir.as_ref();
        let settings_path = path.join(Self::SETTINGS_FILE_NAME);

        let settings_exist = std::fs::exists(&settings_path)?;

        if !settings_exist {
            println!("{:?}", settings_path);
            let mut file = File::create_new(&settings_path)?;
            file.write(b"{}")?;
        }

        Ok(())
    }

    fn new() -> Self {
        let settings = Self {
            settings: HashMap::new(),
        };

        settings.load_settings();

        settings
    }

    pub fn instance() -> &'static Mutex<Self> {
        SETTINGS_INSTANCE.get_or_init(|| Mutex::new(Settings::new()))
    }
}
