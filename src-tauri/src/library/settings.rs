use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    collections::HashMap,
    error::Error,
    fs::File,
    io::Write,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::Manager;

use crate::{
    library::store_unit::{StoreUnit, StoreUnitType},
    APP_INSTANCE,
};

#[derive(Eq, PartialEq, Clone, Copy, Serialize, Deserialize, Hash)]
#[serde(rename_all = "snake_case")]
pub enum SETTING {
    Theme,
    BookLoadPath,
}

pub struct SettingsStore {
    store: HashMap<SETTING, StoreUnitType>,
}

static SETTINGS_STORE_INSTANCE: OnceCell<Mutex<SettingsStore>> = OnceCell::new();

impl StoreUnit<SETTING> for SettingsStore {
    const STORE_FILE_PATH: &'static str = "settings.json";

    fn get_map(&self) -> &HashMap<SETTING, StoreUnitType> {
        return &self.store;
    }

    fn new() -> Self {
        let mut settings = Self {
            store: HashMap::from([
                (SETTING::Theme, StoreUnitType::String("dark".to_string())),
                (SETTING::BookLoadPath, StoreUnitType::None),
            ]),
        };

        match settings.load() {
            Ok(_) => {}
            Err(e) => eprintln!("Failed to load SettingsStore {:?}", e),
        };

        settings
    }

    fn instance() -> &'static Mutex<Self> {
        SETTINGS_STORE_INSTANCE.get_or_init(|| Mutex::new(Self::new()))
    }

    fn load(&mut self) -> Result<(), Box<dyn Error>> {
        let file_contents = std::fs::read(Self::get_path()?)?;
        let data: SettingsData = serde_json::from_slice(&file_contents)?;
        self.store
            .insert(SETTING::Theme, StoreUnitType::String(data.theme));
        self.store.insert(
            SETTING::BookLoadPath,
            StoreUnitType::String(data.book_load_path),
        );
        Ok(())
    }

    fn set(&mut self, key: SETTING, value: StoreUnitType) -> Result<(), Box<dyn Error>> {
        self.store.insert(key, value);
        Ok(())
    }
}

#[derive(Deserialize, Serialize)]
pub struct SettingsData {
    theme: String,
    book_load_path: String,
}
