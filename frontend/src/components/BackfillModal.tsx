"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { X, CalendarPlus } from "lucide-react";

type BackfillModalProps = {
  habitId: string;
  localDay: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function BackfillModal({ habitId, localDay, onClose, onConfirm }: BackfillModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBackfill() {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/habits/${habitId}/checkins`, { localDay });
      onConfirm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Format date nicely (e.g., "Monday, Mar 12")
  const dateStr = new Date(localDay).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200 perspective-1000">
      <div className="glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 ease-out transform rotate-x-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-4 border border-teal-200 shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <CalendarPlus size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">Backfill Check-in</h3>
          <p className="text-slate-500 font-medium text-sm mb-6">
            You missed checking in on <span className="font-bold text-slate-700">{dateStr}</span>. Would you like to log it now?
          </p>

          {error && (
            <div className="mb-4 w-full text-rose-600 text-sm bg-rose-50 border border-rose-200 p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleBackfill}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-teal-400 hover:bg-teal-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] transform hover:-translate-y-0.5"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
