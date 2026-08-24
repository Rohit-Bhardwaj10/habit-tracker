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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{habit.name}</h3>
          {habit.description && (
            <p className="text-slate-500 text-sm mt-1">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full text-sm font-medium">
          <Flame size={16} className={habit.currentStreak > 0 ? "fill-orange-500" : ""} />
          <span>{habit.currentStreak} Day Streak</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-sm font-medium">
          <Trophy size={16} />
          <span>Best: {habit.longestStreak}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {habit.checkedInToday ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium bg-emerald-100 text-emerald-700 cursor-not-allowed"
          >
            <Check size={18} />
            Done Today
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "Checking In..." : "Check In"}
          </button>
        )}
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Link
          href={`/habits/${habit.id}`}
          className="flex items-center justify-center gap-1 w-full py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors mt-2"
        >
          View History
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
