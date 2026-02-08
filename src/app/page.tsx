"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, Anvil } from "lucide-react";
import type { JobCard, Column, ColumnId } from "@/types";
import KanbanColumn from "@/components/KanbanColumn";
import JobCardComponent from "@/components/JobCard";
import CreateJobModal from "@/components/CreateJobModal";

const COLUMNS: Column[] = [
  { id: "considering", title: "Considering", color: "bg-sky-50", accent: "bg-sky-500" },
  { id: "applied", title: "Applied", color: "bg-blue-50", accent: "bg-blue-500" },
  { id: "interviewing", title: "Interviewing", color: "bg-amber-50", accent: "bg-amber-500" },
  { id: "offer", title: "Offer", color: "bg-emerald-50", accent: "bg-emerald-500" },
  { id: "rejected", title: "Rejected", color: "bg-rose-50", accent: "bg-rose-400" },
];

export default function Home() {
  const [cards, setCards] = useState<JobCard[]>([]);
  const [activeCard, setActiveCard] = useState<JobCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const getColumnCards = useCallback(
    (columnId: ColumnId) => cards.filter((card) => card.columnId === columnId),
    [cards]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      if (activeCard.columnId !== overColumn.id) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === activeId ? { ...c, columnId: overColumn.id } : c
          )
        );
      }
      return;
    }

    const overCard = cards.find((c) => c.id === overId);
    if (!overCard || activeCard.columnId === overCard.columnId) return;

    setCards((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, columnId: overCard.columnId } : c
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCard = cards.find((c) => c.id === activeId);
    const overCard = cards.find((c) => c.id === overId);

    if (activeCard && overCard && activeCard.columnId === overCard.columnId) {
      setCards((prev) => {
        const columnCards = prev.filter(
          (c) => c.columnId === activeCard.columnId
        );
        const otherCards = prev.filter(
          (c) => c.columnId !== activeCard.columnId
        );
        const oldIndex = columnCards.findIndex((c) => c.id === activeId);
        const newIndex = columnCards.findIndex((c) => c.id === overId);
        const reordered = arrayMove(columnCards, oldIndex, newIndex);
        return [...otherCards, ...reordered];
      });
    }
  };

  const handleCreateCard = (
    cardData: Omit<JobCard, "id" | "createdAt" | "columnId">
  ) => {
    const newCard: JobCard = {
      ...cardData,
      id: crypto.randomUUID(),
      columnId: "considering",
      createdAt: new Date().toISOString(),
    };
    setCards((prev) => [...prev, newCard]);
    setIsModalOpen(false);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-board">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Anvil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                JobForge
              </h1>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                {cards.length} application{cards.length !== 1 ? "s" : ""} tracked
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all duration-150 hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Application
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="max-w-[1920px] mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getColumnCards(column.id)}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <div className="drag-overlay">
                  <JobCardComponent card={activeCard} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCard}
      />
    </div>
  );
}
