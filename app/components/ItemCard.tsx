"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Tag } from "lucide-react";
import type { Item, Tag as TagType } from "../lib/types";
import { cn } from "../lib/utils";

interface ItemCardProps {
  item: Item;
  tags: TagType[];
  assignedTagIds: string[];
  onAssignTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}

export default function ItemCard({
  item,
  tags,
  assignedTagIds,
  onAssignTag,
  onRemoveTag,
}: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const assignedTags = tags.filter((tag) => assignedTagIds.includes(tag.id));
  const availableTags = tags.filter((tag) => !assignedTagIds.includes(tag.id));

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-visible">
      {/* Color swatch */}
      <div
        className="h-24 w-full rounded-t-2xl flex-shrink-0"
        style={{ backgroundColor: item.color }}
        aria-hidden="true"
      />

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-foreground leading-tight">{item.name}</h3>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-1.5 min-h-[22px]">
          {assignedTags.length === 0 ? (
            <span className="text-xs text-muted-foreground self-center">No tags</span>
          ) : (
            assignedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-medium"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
                  aria-label={`Remove ${tag.name} from ${item.name}`}
                  className="text-accent-foreground/60 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Tag picker */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            disabled={tags.length === 0}
            title={tags.length === 0 ? "Create a tag first" : undefined}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border",
              "px-3 py-1.5 text-xs font-medium text-muted-foreground",
              "hover:border-primary/50 hover:text-primary hover:bg-accent transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <Tag className="h-3 w-3" />
            Add tag
            <ChevronDown
              className={cn("h-3 w-3 transition-transform ml-auto", menuOpen && "rotate-180")}
            />
          </button>

          {menuOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[200] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="max-h-44 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                {availableTags.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground text-center">
                    All tags assigned
                  </p>
                ) : (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        onAssignTag(tag.id);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
