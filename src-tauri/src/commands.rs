use rusqlite::{params, Connection};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

pub struct DbState(pub Mutex<Connection>);

#[derive(Serialize)]
pub struct TagRow {
  pub id: String,
  pub name: String,
}

#[derive(Serialize)]
pub struct AssignmentRow {
  pub item_id: String,
  pub tag_id: String,
}

#[tauri::command]
pub fn list_tags(state: State<DbState>) -> Result<Vec<TagRow>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, name FROM tags ORDER BY name COLLATE NOCASE")
    .map_err(|e| e.to_string())?;
  let rows = stmt
    .query_map([], |row| {
      Ok(TagRow {
        id: row.get(0)?,
        name: row.get(1)?,
      })
    })
    .map_err(|e| e.to_string())?;
  rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_tag(state: State<DbState>, id: String, name: String) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute(
      "INSERT INTO tags (id, name) VALUES (?1, ?2)",
      params![id, name],
    )
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub fn delete_tag(state: State<DbState>, id: String) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute("DELETE FROM tags WHERE id = ?1", params![id])
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub fn list_assignments(state: State<DbState>) -> Result<Vec<AssignmentRow>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT item_id, tag_id FROM item_tags")
    .map_err(|e| e.to_string())?;
  let rows = stmt
    .query_map([], |row| {
      Ok(AssignmentRow {
        item_id: row.get(0)?,
        tag_id: row.get(1)?,
      })
    })
    .map_err(|e| e.to_string())?;
  rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn assign_tag(state: State<DbState>, item_id: String, tag_id: String) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute(
      "INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?1, ?2)",
      params![item_id, tag_id],
    )
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub fn unassign_tag(state: State<DbState>, item_id: String, tag_id: String) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute(
      "DELETE FROM item_tags WHERE item_id = ?1 AND tag_id = ?2",
      params![item_id, tag_id],
    )
    .map_err(|e| e.to_string())?;
  Ok(())
}
