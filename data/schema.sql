-- Collections & Tags — local SQLite schema
-- Applied automatically on app startup (see src-tauri/src/db.rs::init_db).
-- Database file lives at the OS-specific Tauri app-data dir, e.g.
-- ~/Library/Application Support/com.pritamgain.collectionstags/collections-tags.sqlite

PRAGMA foreign_keys = ON;

-- A tag that can be assigned to any item, e.g. "Approved", "Needs Review".
CREATE TABLE IF NOT EXISTS tags (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Many-to-many join between (hardcoded) items and tags. `item_id` refers to
-- the stable id baked into app/lib/sample-data.ts; items themselves are not
-- persisted since the spec treats them as fixed sample data.
CREATE TABLE IF NOT EXISTS item_tags (
  item_id TEXT NOT NULL,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);
