import { invoke } from "@tauri-apps/api/core";
import type { Assignments, Tag } from "./types";

interface TagRow {
  id: string;
  name: string;
}

interface AssignmentRow {
  item_id: string;
  tag_id: string;
}

// Running `next dev` directly in a browser (outside the Tauri shell) has no
// `__TAURI_INTERNALS__` global, so every persistence call below becomes a
// harmless no-op and the app falls back to plain in-memory state.
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
