"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Activity } from "lucide-react";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    gsap.fromTo(
      ".auth-anim",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden perspective-1000">
      {/* Background glow effects */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-300/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/40 blur-[100px] pointer-events-none" />

      <div ref={containerRef} className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="auth-anim flex justify-center text-rose-400">
          <Activity size={48} className="drop-shadow-[0_0_15px_rgba(244,114,182,0.3)]" />
        </div>
        <h2 className="auth-anim mt-6 text-center text-3xl font-extrabold text-slate-800">
          Welcome back
        </h2>
        <p className="auth-anim mt-2 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-rose-500 hover:text-rose-400 transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="auth-anim mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-rose-400 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-white disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(244,114,182,0.3)] hover:shadow-[0_0_30px_rgba(244,114,182,0.5)] transform hover:-translate-y-0.5"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
