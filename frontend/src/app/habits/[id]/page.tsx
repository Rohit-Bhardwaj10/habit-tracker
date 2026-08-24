"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Activity, ArrowLeft, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HistoryCalendar from "@/components/HistoryCalendar";

type HabitDetail = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  totalCheckIns: number;
};

type CheckIn = {
  id: string;
  localDay: string;
};

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHabitData() {
    try {
      const [profileRes, habitRes, checkInsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get(`/habits/${id}`),
        api.get(`/habits/${id}/checkins?limit=365`), // Get enough history for 365-day calendar
      ]);
      setUserProfile(profileRes);
      setHabit(habitRes);
      setCheckIns(checkInsRes.checkIns || []);
    } catch (error) {
      // Errors handled by api
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabitData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Activity className="animate-pulse text-emerald-500" size={48} />
      </div>
    );
  }

  if (!habit || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-800">Habit not found</h2>
        <Link href="/dashboard" className="text-emerald-600 hover:underline mt-2">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900">{habit.name}</h1>
            {habit.description && (
              <p className="text-slate-500 mt-2 text-lg">{habit.description}</p>
            )}

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                  <Flame size={24} className={habit.currentStreak > 0 ? "fill-orange-500" : ""} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Current Streak</div>
                  <div className="text-2xl font-bold text-slate-900">{habit.currentStreak} days</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Longest Streak</div>
                  <div className="text-2xl font-bold text-slate-900">{habit.longestStreak} days</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Total Check-ins</div>
                  <div className="text-2xl font-bold text-slate-900">{habit.totalCheckIns}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 overflow-x-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Last 365 Days</h2>
            <HistoryCalendar
              habitId={habit.id}
              createdAt={habit.createdAt}
              checkIns={checkIns}
              userTimezone={userProfile.timezone}
              onCheckInSuccess={fetchHabitData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
