export type ColumnId =
  | "considering"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type WorkType = "Remote" | "Hybrid" | "On-site";

export interface JobCard {
  id: string;
  user_id: string;
  company: string;
  title: string;
  compensationMin: string;
  compensationMax: string;
  location: string;
  type: WorkType;
  url: string;
  notes: string;
  columnId: ColumnId;
  position: number;
  createdAt: string;
}

/** Shape of a row coming from Supabase */
export interface DbApplication {
  id: string;
  user_id: string;
  company: string;
  title: string;
  compensation_min: string;
  compensation_max: string;
  location: string;
  work_type: WorkType;
  url: string;
  notes: string;
  column_id: ColumnId;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  accent: string;
}

/** Map a DB row to our frontend model */
export function dbToCard(row: DbApplication): JobCard {
  return {
    id: row.id,
    user_id: row.user_id,
    company: row.company,
    title: row.title,
    compensationMin: row.compensation_min,
    compensationMax: row.compensation_max,
    location: row.location,
    type: row.work_type,
    url: row.url,
    notes: row.notes,
    columnId: row.column_id,
    position: row.position,
    createdAt: row.created_at,
  };
}
