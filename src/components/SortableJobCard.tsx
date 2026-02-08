"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { JobCard } from "@/types";
import JobCardComponent from "./JobCard";

interface SortableJobCardProps {
  card: JobCard;
  onDelete: (id: string) => void;
}

export default function SortableJobCard({
  card,
  onDelete,
}: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCardComponent card={card} onDelete={onDelete} />
    </div>
  );
}
