mod commands;
mod db;

use commands::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let conn = db::init_db(app.handle());
      app.manage(DbState(Mutex::new(conn)));

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::list_tags,
      commands::create_tag,
      commands::delete_tag,
      commands::list_assignments,
      commands::assign_tag,
      commands::unassign_tag,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
