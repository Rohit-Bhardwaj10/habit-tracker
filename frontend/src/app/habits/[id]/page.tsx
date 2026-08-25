"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Activity, ArrowLeft, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HistoryCalendar from "@/components/HistoryCalendar";
import gsap from "gsap";

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

  async function fetchHabitData(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const [profileRes, habitRes, checkInsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get(`/habits/${id}`),
        api.get(`/habits/${id}/checkins?limit=365`),
      ]);
      setUserProfile(profileRes);
      setHabit(habitRes);
      setCheckIns(checkInsRes.checkIns || []);
    } catch (error) {
      // Errors handled by api
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabitData();
  }, [id]);

  useEffect(() => {
    if (!loading && habit) {
      gsap.fromTo(
        ".detail-anim",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [loading, habit]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 relative bg-[var(--background)]">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 perspective-1000">
          <div className="inline-flex items-center gap-2 text-slate-300 mb-6 font-semibold w-40 h-6 bg-slate-200/50 rounded animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
          <div className="detail-anim glass-card rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative overflow-hidden">
             {/* Shimmer effect for whole card */}
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"></div>
             
             <div className="p-8 sm:p-10 border-b border-white/40 bg-white/30">
               <div className="h-10 bg-slate-200/60 rounded-lg w-1/2 mb-3"></div>
               <div className="h-6 bg-slate-200/50 rounded-lg w-3/4 mb-10"></div>
               
               <div className="flex flex-wrap gap-4 sm:gap-6 mt-10">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-slate-200 flex-1 min-w-[200px] h-24">
                     <div className="h-14 w-14 rounded-xl bg-slate-200/60 shrink-0"></div>
                     <div className="w-full flex flex-col gap-2">
                       <div className="h-4 bg-slate-200/50 rounded-md w-2/3"></div>
                       <div className="h-8 bg-slate-200/60 rounded-md w-1/2"></div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="p-8 sm:p-10 bg-white/10 h-80 flex flex-col">
               <div className="h-8 bg-slate-200/60 rounded-lg w-1/3 mb-8"></div>
               <div className="flex-1 bg-slate-200/40 rounded-2xl"></div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  if (!habit || !userProfile) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-[var(--background)]">
        <h2 className="text-xl font-bold text-slate-800">Habit not found</h2>
        <Link href="/dashboard" className="text-rose-500 hover:text-rose-400 mt-2 transition-colors font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 relative bg-[var(--background)]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 perspective-1000">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="detail-anim glass-card rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="p-8 sm:p-10 border-b border-white/40 bg-white/30">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{habit.name}</h1>
            {habit.description && (
              <p className="text-slate-600 mt-3 text-lg max-w-2xl font-medium">{habit.description}</p>
            )}

            <div className="flex flex-wrap gap-4 sm:gap-6 mt-10">
              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-slate-200 flex-1 min-w-[200px] shadow-sm hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-amber-100 text-amber-500 rounded-xl border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Flame size={28} className={habit.currentStreak > 0 ? "fill-amber-400" : ""} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Current Streak</div>
                  <div className="text-3xl font-bold text-slate-800">{habit.currentStreak} <span className="text-lg font-medium text-slate-400">days</span></div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-slate-200 flex-1 min-w-[200px] shadow-sm hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-sky-100 text-sky-500 rounded-xl border border-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Longest Streak</div>
                  <div className="text-3xl font-bold text-slate-800">{habit.longestStreak} <span className="text-lg font-medium text-slate-400">days</span></div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-slate-200 flex-1 min-w-[200px] shadow-sm hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-teal-100 text-teal-500 rounded-xl border border-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  <Activity size={28} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Total Check-ins</div>
                  <div className="text-3xl font-bold text-slate-800">{habit.totalCheckIns}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 overflow-x-hidden bg-white/10">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              Contribution History
            </h2>
            <HistoryCalendar
              habitId={habit.id}
              createdAt={habit.createdAt}
              checkIns={checkIns}
              userTimezone={userProfile.timezone}
              onCheckInSuccess={() => fetchHabitData(false)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
