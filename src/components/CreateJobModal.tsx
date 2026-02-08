"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { X, Briefcase } from "lucide-react";
import type { JobCard } from "@/types";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (card: Omit<JobCard, "id" | "createdAt" | "columnId">) => void;
}

const initialForm = {
  company: "",
  title: "",
  compensationMin: "",
  compensationMax: "",
  location: "",
  type: "Remote" as JobCard["type"],
  url: "",
  notes: "",
};

export default function CreateJobModal({
  isOpen,
  onClose,
  onCreate,
}: CreateJobModalProps) {
  const [form, setForm] = useState(initialForm);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.title.trim()) return;
    onCreate(form);
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-150";

  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-200/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              New Application
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company & Title row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Company <span className="text-rose-400">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                placeholder="Acme Corp"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Senior Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Compensation row */}
          <div>
            <label className={labelClass}>Compensation Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  placeholder="80,000"
                  value={form.compensationMin}
                  onChange={(e) =>
                    setForm({ ...form, compensationMin: e.target.value })
                  }
                  className={`${inputClass} pl-7`}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  placeholder="120,000"
                  value={form.compensationMax}
                  onChange={(e) =>
                    setForm({ ...form, compensationMax: e.target.value })
                  }
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          </div>

          {/* Location & Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Work Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as JobCard["type"],
                  })
                }
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className={labelClass}>Job Posting URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              placeholder="Anything to remember about this role..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all duration-150 hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
            >
              Add Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
