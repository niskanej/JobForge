export type ColumnId =
  | "considering"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export interface JobCard {
  id: string;
  company: string;
  title: string;
  compensationMin: string;
  compensationMax: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  url: string;
  notes: string;
  columnId: ColumnId;
  createdAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  accent: string;
}
