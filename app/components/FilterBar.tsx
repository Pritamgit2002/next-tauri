"use client";

import type { Tag } from "../lib/types";
import { cn } from "../lib/utils";

interface FilterBarProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  itemCounts: Record<string, number>;
  totalItems: number;
}

export default function FilterBar({
  tags,
  selectedTagId,
  onSelectTag,
  itemCounts,
  totalItems,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by tag"
    >
      <FilterPill
        active={selectedTagId === null}
        onClick={() => onSelectTag(null)}
        count={totalItems}
      >
        All
      </FilterPill>

      {tags.map((tag) => (
        <FilterPill
          key={tag.id}
          active={selectedTagId === tag.id}
          onClick={() => onSelectTag(tag.id)}
          count={itemCounts[tag.id] ?? 0}
        >
          {tag.name}
        </FilterPill>
      ))}
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-accent"
      )}
    >
      {children}
      <span
        className={cn(
          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
          active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}
