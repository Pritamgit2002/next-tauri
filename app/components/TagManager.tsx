"use client";

import { useState } from "react";
import { Tag as TagIcon, Plus, X } from "lucide-react";
import type { Tag } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (name: string) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function TagManager({
  tags,
  onCreateTag,
  onDeleteTag,
}: TagManagerProps) {
  const [name, setName] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreateTag(name);
    setName("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <TagIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tags
        </h2>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="New tag name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          aria-label="New tag name"
          className="flex-1 min-w-0"
        />
        <Button type="submit" size="sm" disabled={!name.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </form>

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No tags yet — create one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2",
                "bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-primary/60" />
                {tag.name}
              </span>
              <button
                type="button"
                onClick={() => onDeleteTag(tag.id)}
                aria-label={`Delete tag ${tag.name}`}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all rounded p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
