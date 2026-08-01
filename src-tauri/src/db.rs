use rusqlite::Connection;
use tauri::{AppHandle, Manager};

/// Opens (creating if needed) the local SQLite database in the app's data
/// directory and runs the migrations for the tags / item_tags tables.
pub fn init_db(app: &AppHandle) -> Connection {
  let app_dir = app
    .path()
    .app_data_dir()
    .expect("failed to resolve app data dir");
  std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
  let db_path = app_dir.join("collections-tags.sqlite");

  let conn = Connection::open(db_path).expect("failed to open sqlite database");
  conn
    .execute_batch(
      "
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS item_tags (
        item_id TEXT NOT NULL,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, tag_id)
      );
      ",
    )
    .expect("failed to run migrations");

  conn
}
