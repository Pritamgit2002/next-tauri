export interface Item {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
}

export type Assignments = Record<string, string[]>;
