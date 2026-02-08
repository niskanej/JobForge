"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Column, JobCard } from "@/types";
import SortableJobCard from "./SortableJobCard";

interface KanbanColumnProps {
  column: Column;
  cards: JobCard[];
  onDeleteCard: (id: string) => void;
}

export default function KanbanColumn({
  column,
  cards,
  onDeleteCard,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={`w-[300px] flex-shrink-0 flex flex-col rounded-2xl transition-all duration-200 ${
        isOver ? "ring-2 ring-blue-400/30 ring-offset-2 ring-offset-board" : ""
      }`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-2xl ${column.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${column.accent}`} />
            <h2 className="text-[13px] font-semibold text-slate-700 tracking-wide uppercase">
              {column.title}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 tabular-nums bg-white/60 px-2.5 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 min-h-[200px] rounded-b-2xl transition-colors duration-200 ${
          isOver ? "bg-blue-50/50" : "bg-slate-100/50"
        }`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SortableJobCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">Drop applications here</p>
          </div>
        )}
      </div>
    </div>
  );
}
