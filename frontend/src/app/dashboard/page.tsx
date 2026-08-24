"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import HabitCard from "@/components/HabitCard";
import { Activity, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

type Habit = {
  id: string;
  name: string;
  description?: string;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  totalCheckIns: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New habit form
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  async function fetchHabits(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const data = await api.get("/habits");
      setHabits(data.habits || []);
    } catch (error) {
      // API wrapper handles 401 redirect
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits(true);
  }, []);

  // GSAP animation on habits load
  useEffect(() => {
    if (!loading && habits.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.habit-card-wrapper');
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0, rotateX: 15 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: "power3.out",
          clearProps: "all" // Allows hover effects to work after animation
        }
      );
    }
  }, [loading, habits.length]);

  async function handleCreateHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setCreateLoading(true);
    try {
      await api.post("/habits", { name: newName, description: newDesc || undefined });
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
      fetchHabits(false); // Reload list without full page spinner
    } catch (error) {
      alert("Failed to create habit");
    } finally {
      setCreateLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Activity className="animate-pulse text-rose-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 relative bg-[var(--background)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 perspective-1000">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Habits</h1>
            <p className="text-slate-500 mt-1 font-medium">Keep the streak alive.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 glass border border-white/60 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-white/60 hover:border-white transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            New Habit
          </button>
        </div>

        {isCreating && (
          <div className="glass-card rounded-2xl p-6 mb-10 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
              <Sparkles className="text-rose-400" size={20} />
              Create a New Habit
            </h3>
            <form onSubmit={handleCreateHabit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Habit Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Read 10 pages"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Why are you doing this?"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 font-bold bg-rose-400 text-white hover:bg-rose-500 rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)] transform hover:-translate-y-0.5"
                >
                  {createLoading ? "Creating..." : "Create Habit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {habits.length === 0 && !isCreating ? (
          <div className="text-center py-24 glass-card rounded-2xl border-dashed border-2 border-slate-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100/60 mb-4 shadow-sm">
              <Activity className="text-rose-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No habits yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto font-medium">You haven't created any habits. Get started by setting your first goal.</p>
            <div className="mt-8">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 bg-rose-400 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)] transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Create First Habit
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <div key={habit.id} className="habit-card-wrapper">
                <HabitCard habit={habit} onCheckIn={() => fetchHabits(false)} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
