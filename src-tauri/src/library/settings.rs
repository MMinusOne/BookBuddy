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

#[derive(Eq, PartialEq, Clone, Copy, Serialize, Deserialize)]
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
        let settings = Self {
            store: HashMap::new(),
        };

        settings.load();

        settings
    }

    fn instance() -> &'static Mutex<Self> {
        SETTINGS_STORE_INSTANCE.get_or_init(|| Mutex::new(Self::new()))
    }

    fn load(&self) -> ! {
        todo!()
    }

    fn set(&self) -> ! {
        todo!()
    }
}
