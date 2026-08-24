"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("accessToken"));
  }, [pathname]);

  // Don't show navbar on auth pages or landing page
  if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setHasToken(false);
    router.push("/login");
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50">
      <nav className="glass-card bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.3)] group-hover:shadow-[0_0_20px_rgba(244,114,182,0.5)] transition-shadow">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Streaks
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {hasToken && (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-4 py-2 rounded-xl hover:bg-white/60 shadow-sm border border-transparent hover:border-white/50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
