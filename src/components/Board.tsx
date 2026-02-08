"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Plus, Anvil, LogOut, Loader2 } from "lucide-react";
import type { JobCard, Column, ColumnId, DbApplication } from "@/types";
import { dbToCard } from "@/types";
import { createClient } from "@/lib/supabase/client";
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

export default function Board() {
  const [cards, setCards] = useState<JobCard[]>([]);
  const [activeCard, setActiveCard] = useState<JobCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const supabase = createClient();

  // Load user & applications on mount
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && data) {
        setCards((data as DbApplication[]).map(dbToCard));
      }
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const getColumnCards = useCallback(
    (columnId: ColumnId) =>
      cards
        .filter((card) => card.columnId === columnId)
        .sort((a, b) => a.position - b.position),
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

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedCard = cards.find((c) => c.id === activeId);
    if (!draggedCard) return;

    let updatedCards = [...cards];

    if (activeId !== overId) {
      const overCard = cards.find((c) => c.id === overId);
      if (overCard && draggedCard.columnId === overCard.columnId) {
        const columnCards = updatedCards
          .filter((c) => c.columnId === draggedCard.columnId)
          .sort((a, b) => a.position - b.position);
        const otherCards = updatedCards.filter(
          (c) => c.columnId !== draggedCard.columnId
        );
        const oldIndex = columnCards.findIndex((c) => c.id === activeId);
        const newIndex = columnCards.findIndex((c) => c.id === overId);
        const reordered = arrayMove(columnCards, oldIndex, newIndex).map(
          (c, i) => ({ ...c, position: i })
        );
        updatedCards = [...otherCards, ...reordered];
      }
    }

    // Recalculate positions for the column the card ended in
    const finalCard = updatedCards.find((c) => c.id === activeId)!;
    const columnCards = updatedCards
      .filter((c) => c.columnId === finalCard.columnId)
      .sort((a, b) => a.position - b.position)
      .map((c, i) => ({ ...c, position: i }));

    const otherCards = updatedCards.filter(
      (c) => c.columnId !== finalCard.columnId
    );
    updatedCards = [...otherCards, ...columnCards];

    setCards(updatedCards);

    // Persist all cards in the affected column
    const updates = columnCards.map((c) =>
      supabase
        .from("applications")
        .update({ column_id: c.columnId, position: c.position })
        .eq("id", c.id)
    );
    await Promise.all(updates);
  };

  const handleCreateCard = async (
    cardData: Omit<JobCard, "id" | "createdAt" | "columnId" | "user_id" | "position">
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const columnCards = cards.filter((c) => c.columnId === "considering");
    const nextPosition = columnCards.length;

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company: cardData.company,
        title: cardData.title,
        compensation_min: cardData.compensationMin,
        compensation_max: cardData.compensationMax,
        location: cardData.location,
        work_type: cardData.type,
        url: cardData.url,
        notes: cardData.notes,
        column_id: "considering",
        position: nextPosition,
      })
      .select()
      .single();

    if (!error && data) {
      setCards((prev) => [...prev, dbToCard(data as DbApplication)]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCard = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("applications").delete().eq("id", id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your board...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all duration-150 hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-150 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
