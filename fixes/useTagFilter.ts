import { useMemo, useState } from "react";

interface Item {
  id: string;
  tags: string[];
}

function useTagFilter(items: Item[], _tags: string[]) {
  const [selected, setSelected] = useState<string | null>(null);

  // Bug 1: the original `useEffect` only listed `items` in its dependency array,
  // so changing `selected` never re-ran the filter until `items` happened to change
  // on some unrelated interaction. Deriving `filtered` with `useMemo` keyed on both
  // `items` and `selected` means the list updates the instant the filter changes.
  //
  // Bug 2: the original effect ended with `setSelected(selected)`, a redundant
  // self-set that ran on every `items` change for no reason — under heavy tag
  // counts this extra state write (paired with state+effect duplicating what a
  // pure derived value should do) was the source of the reported render loop.
  // Removing it and computing `filtered` as a plain derived value eliminates the
  // unnecessary render/effect cycle entirely.
  const filtered = useMemo(() => {
    if (!selected) return items;
    return items.filter((item) => item.tags.includes(selected));
  }, [items, selected]);

  return { filtered, selected, setSelected };
}

export default useTagFilter;
