"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Flame, Trophy, Check, ArrowRight } from "lucide-react";

type Habit = {
  id: string;
  name: string;
  description?: string;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  totalCheckIns: number;
};

export default function HabitCard({ habit, onCheckIn }: { habit: Habit; onCheckIn: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn() {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/habits/${habit.id}/checkins`);
      onCheckIn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.02)] transition-all duration-500 ease-out group">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-500 transition-colors">{habit.name}</h3>
          {habit.description && (
            <p className="text-slate-500 text-sm mt-1 font-medium">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${habit.currentStreak > 0 ? "bg-amber-100/80 text-amber-600 border border-amber-200/50" : "bg-slate-100/80 text-slate-500 border border-slate-200/50"}`}>
          <Flame size={16} className={habit.currentStreak > 0 ? "fill-amber-400" : ""} />
          <span>{habit.currentStreak} Day Streak</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-sky-100/80 text-sky-600 border border-sky-200/50">
          <Trophy size={16} />
          <span>Best: {habit.longestStreak}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {habit.checkedInToday ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-teal-100/80 text-teal-600 border border-teal-200/80 cursor-not-allowed shadow-sm"
          >
            <Check size={18} />
            Done Today
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-rose-400 text-white hover:bg-rose-500 disabled:opacity-70 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)] transform hover:-translate-y-0.5"
          >
            {loading ? "Checking In..." : "Check In"}
          </button>
        )}
        
        {error && <p className="text-rose-600 text-sm text-center bg-rose-50 rounded-lg p-2 border border-rose-200">{error}</p>}

        <Link
          href={`/habits/${habit.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 transition-colors"
        >
          View History
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
