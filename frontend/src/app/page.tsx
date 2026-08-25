"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    // Subtle float animation on load for the hero content
    gsap.fromTo(
      ".hero-anim",
      { y: 30, opacity: 0, rotateX: 10 },
      { y: 0, opacity: 1, rotateX: 0, stagger: 0.15, duration: 1.2, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--background)]">
      {/* Background soft pastel glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-amber-200/30 blur-[100px] pointer-events-none" />
      
      {/* Light Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 perspective-1000">
        
        <div ref={heroRef} className="text-center max-w-3xl mx-auto space-y-8">
          
          <div className="hero-anim inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/60 text-rose-500 text-sm font-semibold mb-4 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Premium Habit Tracking
          </div>
          
          <h1 className="hero-anim text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800">
            Build habits that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 text-glow-pastel">
              actually last.
            </span>
          </h1>
          
          <p className="hero-anim mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop breaking the chain. Streaks provides the beautiful, frictionless 
            environment you need to stay consistent and achieve your goals.
          </p>
          
          <div className="hero-anim mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl font-bold text-white bg-rose-400 hover:bg-rose-500 transition-all duration-300 shadow-[0_0_20px_rgba(244,114,182,0.3)] hover:shadow-[0_0_30px_rgba(244,114,182,0.5)] transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-xl font-bold text-white bg-rose-400 hover:bg-rose-500 transition-all duration-300 shadow-[0_0_20px_rgba(244,114,182,0.3)] hover:shadow-[0_0_30px_rgba(244,114,182,0.5)] transform hover:-translate-y-1"
                >
                  Start Tracking Free
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-xl font-bold text-slate-700 glass hover:bg-white/60 transition-all duration-300 border border-white/70 hover:border-white shadow-sm transform hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
