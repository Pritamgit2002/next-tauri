"use client";

import { useEffect, useMemo, useState } from "react";
import { SAMPLE_ITEMS } from "./lib/sample-data";
import { generateId } from "./lib/id";
import type { Assignments, Tag } from "./lib/types";
import {
  loadPersistedState,
  persistAssignTag,
  persistCreateTag,
  persistDeleteTag,
  persistRemoveTag,
} from "./lib/tauri-db";
import TagManager from "./components/TagManager";
import FilterBar from "./components/FilterBar";
import ItemCard from "./components/ItemCard";
import EmptyState from "./components/EmptyState";

export default function Home() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const items = SAMPLE_ITEMS;

  useEffect(() => {
    let cancelled = false;
    loadPersistedState()
      .then((persisted) => {
        if (cancelled || !persisted) return;
        setTags(persisted.tags);
        setAssignments(persisted.assignments);
      })
      .catch((error) => console.error("Failed to load persisted tags", error));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (tags.some((tag) => tag.name.toLowerCase() === trimmed.toLowerCase())) return;
    const tag: Tag = { id: generateId("tag"), name: trimmed };
    setTags((prev) => [...prev, tag]);
    persistCreateTag(tag).catch((error) => console.error("Failed to persist new tag", error));
  };

  const handleDeleteTag = (tagId: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
    setAssignments((prev) => {
      const next: Assignments = {};
      for (const [itemId, tagIds] of Object.entries(prev)) {
        next[itemId] = tagIds.filter((id) => id !== tagId);
      }
      return next;
    });
    setSelectedTagId((current) => (current === tagId ? null : current));
    persistDeleteTag(tagId).catch((error) => console.error("Failed to persist tag deletion", error));
  };

  const handleAssignTag = (itemId: string, tagId: string) => {
    setAssignments((prev) => {
      const current = prev[itemId] ?? [];
      if (current.includes(tagId)) return prev;
      return { ...prev, [itemId]: [...current, tagId] };
    });
    persistAssignTag(itemId, tagId).catch((error) => console.error("Failed to persist tag assignment", error));
  };

  const handleRemoveTag = (itemId: string, tagId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((id) => id !== tagId),
    }));
    persistRemoveTag(itemId, tagId).catch((error) => console.error("Failed to persist tag removal", error));
  };

  const filteredItems = useMemo(() => {
    if (!selectedTagId) return items;
    return items.filter((item) => (assignments[item.id] ?? []).includes(selectedTagId));
  }, [items, assignments, selectedTagId]);

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of tags) {
      counts[tag.id] = items.filter((item) => (assignments[item.id] ?? []).includes(tag.id)).length;
    }
    return counts;
  }, [tags, items, assignments]);

  return (
    <div className="min-h-screen w-full bg-[hsl(240,5%,97%)] flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              Collections &amp; Tags
            </h1>
            <p className="text-xs text-muted-foreground">Design asset library</p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 flex gap-7 items-start flex-1">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 sticky top-[69px]">
          <TagManager tags={tags} onCreateTag={handleCreateTag} onDeleteTag={handleDeleteTag} />
        </aside>

        {/* Main */}
        <main className="flex flex-col gap-5 flex-1 min-w-0">
          {/* Filter bar */}
          {tags.length > 0 && (
            <FilterBar
              tags={tags}
              selectedTagId={selectedTagId}
              onSelectTag={setSelectedTagId}
              itemCounts={itemCounts}
              totalItems={items.length}
            />
          )}

          {/* Empty: no tags at all */}
          {tags.length === 0 && (
            <EmptyState
              title="No tags yet"
              description="Create your first tag in the sidebar to start organizing your design assets."
            />
          )}

          {/* Grid or empty filter state */}
          {tags.length > 0 && filteredItems.length === 0 ? (
            <EmptyState
              title="No items match this filter"
              description='Try selecting a different tag, or choose "All" to see everything.'
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  tags={tags}
                  assignedTagIds={assignments[item.id] ?? []}
                  onAssignTag={(tagId) => handleAssignTag(item.id, tagId)}
                  onRemoveTag={(tagId) => handleRemoveTag(item.id, tagId)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
