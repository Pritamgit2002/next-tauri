// Copy of app/lib/tauri-db.ts — the frontend functions that call the Tauri
// commands above. Kept here per the submission checklist; app/lib/tauri-db.ts
// is the version actually imported by the running app.

import { invoke } from "@tauri-apps/api/core";
import type { Assignments, Tag } from "../app/lib/types";

interface TagRow {
  id: string;
  name: string;
}

interface AssignmentRow {
  item_id: string;
  tag_id: string;
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function loadPersistedState(): Promise<{
  tags: Tag[];
  assignments: Assignments;
} | null> {
  if (!isTauriRuntime()) return null;

  const [tagRows, assignmentRows] = await Promise.all([
    invoke<TagRow[]>("list_tags"),
    invoke<AssignmentRow[]>("list_assignments"),
  ]);

  const assignments: Assignments = {};
  for (const row of assignmentRows) {
    assignments[row.item_id] = [...(assignments[row.item_id] ?? []), row.tag_id];
  }

  return { tags: tagRows, assignments };
}

export async function persistCreateTag(tag: Tag): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("create_tag", { id: tag.id, name: tag.name });
}

export async function persistDeleteTag(tagId: string): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("delete_tag", { id: tagId });
}

export async function persistAssignTag(itemId: string, tagId: string): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("assign_tag", { itemId, tagId });
}

export async function persistRemoveTag(itemId: string, tagId: string): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke("unassign_tag", { itemId, tagId });
}
