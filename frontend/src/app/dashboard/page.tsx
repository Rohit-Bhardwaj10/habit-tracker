"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import HabitCard from "@/components/HabitCard";
import { Activity, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  async function fetchHabits() {
    setLoading(true);
    try {
      const data = await api.get("/habits");
      setHabits(data.habits || []);
    } catch (error) {
      // API wrapper handles 401 redirect
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  async function handleCreateHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setCreateLoading(true);
    try {
      await api.post("/habits", { name: newName, description: newDesc || undefined });
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
      fetchHabits(); // Reload list
    } catch (error) {
      alert("Failed to create habit");
    } finally {
      setCreateLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Activity className="animate-pulse text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
              <Activity size={24} />
              Habit Tracker
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your Habits</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            New Habit
          </button>
        </div>

        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-8 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Create a New Habit</h3>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Habit Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Read 10 pages"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Why are you doing this?"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg disabled:opacity-70 transition-colors"
                >
                  {createLoading ? "Creating..." : "Create Habit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {habits.length === 0 && !isCreating ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <h3 className="mt-2 text-sm font-medium text-slate-900">No habits</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new habit.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                New Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onCheckIn={fetchHabits} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
