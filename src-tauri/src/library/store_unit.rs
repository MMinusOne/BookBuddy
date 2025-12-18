use crate::APP_INSTANCE;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, error::Error, fs::File, io::Write, path::PathBuf, sync::Mutex};
use tauri::Manager;

#[derive(Serialize, Deserialize, Eq, PartialEq, Clone)]
#[serde(untagged)]
pub enum StoreUnitType {
    String(String),
    Array(Vec<String>),
    None,
}

pub trait StoreUnit<K: Serialize> {
    const STORE_FILE_PATH: &'static str;

    fn get_map(&self) -> &HashMap<K, StoreUnitType>;
    fn get_path() -> Result<PathBuf, Box<dyn Error>> {
        let app_data_dir = APP_INSTANCE.get().unwrap().path().app_data_dir()?;
        Ok(app_data_dir.join(Self::STORE_FILE_PATH))
    }
    fn save(&self) -> Result<(), Box<dyn Error>> {
        let data_content = serde_json::to_string(self.get_map())?;
        let path = Self::get_path()?;
        println!("{:?}", path);
        let mut file = File::create_new(&path)?;
        println!("{:?}", data_content);
        file.write(data_content.as_bytes())?;
        Ok(())
    }
    fn initialize(&mut self) -> Result<(), Box<dyn Error>> {
        let path = Self::get_path()?;

        let exists = std::fs::exists(&path)?;

        if !exists {
            self.save()?;
        }

        Ok(())
    }
    fn load(&mut self) -> Result<(), Box<dyn Error>>;
    fn set(&mut self, key: K, value: StoreUnitType) -> Result<(), Box<dyn Error>>;
    fn instance() -> &'static Mutex<Self>;
    fn new() -> Self;
}
