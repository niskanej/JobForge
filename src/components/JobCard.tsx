"use client";

import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Trash2,
  GripVertical,
  Laptop,
  Wifi,
  Building,
} from "lucide-react";
import type { JobCard } from "@/types";

interface JobCardProps {
  card: JobCard;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
}

const typeIcons = {
  Remote: Wifi,
  Hybrid: Laptop,
  "On-site": Building,
};

const typeColors = {
  Remote: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
  Hybrid: "text-sky-600 bg-sky-50 border-sky-200/60",
  "On-site": "text-amber-600 bg-amber-50 border-amber-200/60",
};

export default function JobCardComponent({
  card,
  isDragging,
  onDelete,
}: JobCardProps) {
  const TypeIcon = typeIcons[card.type];

  const compensation =
    card.compensationMin || card.compensationMax
      ? `${card.compensationMin ? `$${Number(card.compensationMin).toLocaleString()}` : ""}${card.compensationMin && card.compensationMax ? " – " : ""}${card.compensationMax ? `$${Number(card.compensationMax).toLocaleString()}` : ""}`
      : null;

  return (
    <div
      className={`bg-white rounded-xl p-3.5 group border transition-all duration-150 cursor-grab active:cursor-grabbing ${
        isDragging
          ? "shadow-xl shadow-slate-300/50 border-blue-200"
          : "shadow-sm shadow-slate-200/50 border-slate-200/80 hover:shadow-md hover:border-slate-300/80"
      }`}
    >
      {/* Drag handle + Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-semibold text-slate-800 truncate leading-tight">
            {card.title}
          </h3>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs text-slate-500 truncate font-medium">{card.company}</span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Work Type */}
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeColors[card.type]}`}
        >
          <TypeIcon className="w-3 h-3" />
          {card.type}
        </span>

        {/* Location */}
        {card.location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/60">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{card.location}</span>
          </span>
        )}

        {/* Compensation */}
        {compensation && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/60">
            <DollarSign className="w-3 h-3" />
            {compensation}
          </span>
        )}
      </div>

      {/* Notes */}
      {card.notes && (
        <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed line-clamp-2 border-t border-slate-100 pt-2">
          {card.notes}
        </p>
      )}
    </div>
  );
}
