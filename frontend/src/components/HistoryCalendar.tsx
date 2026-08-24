"use client";

import { useState } from "react";
import BackfillModal from "./BackfillModal";
import { api } from "@/lib/api";

type CheckIn = {
  id: string;
  localDay: string;
};

type HistoryCalendarProps = {
  habitId: string;
  createdAt: string; // ISO string
  checkIns: CheckIn[];
  userTimezone: string;
  onCheckInSuccess: () => void;
};

export default function HistoryCalendar({ habitId, createdAt, checkIns, userTimezone, onCheckInSuccess }: HistoryCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInMap = new Set(checkIns.map((c) => c.localDay));
  
  // Compute last 90 days in user timezone
  const days = [];
  const now = new Date();
  // Using Intl to get the current date in the user's timezone
  // A simple hack to subtract days is to subtract 24h, but daylight savings could mess that up.
  // Instead, we can just use UTC to represent local days securely, since we just need 90 consecutive days ending today.
  
  // Format today in user's timezone:
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const todayStr = formatter.format(now);
  
  // Parse todayStr as UTC to do simple math
  const todayUtc = new Date(`${todayStr}T00:00:00Z`);
  const createdUtc = new Date(`${formatter.format(new Date(createdAt))}T00:00:00Z`);

  for (let i = 364; i >= 0; i--) {
    const d = new Date(todayUtc.getTime() - i * 86400000);
    const dayStr = d.toISOString().split("T")[0];
    
    // Day is valid if it's >= createdDate
    const isValid = d.getTime() >= createdUtc.getTime();
    
    days.push({
      localDay: dayStr,
      isCheckedIn: checkInMap.has(dayStr),
      isValid, // Cannot backfill before creation
    });
  }

  async function handleBackfill() {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/habits/${habitId}/checkins`, { localDay: selectedDate });
      onCheckInSuccess();
      setSelectedDate(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 items-end">
        {/* Day Labels */}
        <div className="grid grid-rows-7 gap-1 text-[10px] text-slate-400 font-medium pb-[2px]">
          <div className="h-4 flex items-center justify-end pr-1"></div>
          <div className="h-4 flex items-center justify-end pr-1">Mon</div>
          <div className="h-4 flex items-center justify-end pr-1"></div>
          <div className="h-4 flex items-center justify-end pr-1">Wed</div>
          <div className="h-4 flex items-center justify-end pr-1"></div>
          <div className="h-4 flex items-center justify-end pr-1">Fri</div>
          <div className="h-4 flex items-center justify-end pr-1"></div>
        </div>
        
        <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Pad start of grid to align correct day of week for the 365th day ago */}
          {Array.from({ length: new Date(`${days[0].localDay}T00:00:00Z`).getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="w-3 h-3 rounded-sm" />
          ))}

          {days.map((day) => {
            if (day.isCheckedIn) {
              return (
                <div
                  key={day.localDay}
                  title={`${day.localDay} - Checked In`}
                  className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600 shadow-sm"
                />
              );
            }

            if (!day.isValid) {
              return (
                <div
                  key={day.localDay}
                  title={`${day.localDay} - Before creation`}
                  className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 opacity-50"
                />
              );
            }

            return (
              <button
                key={day.localDay}
                title={`${day.localDay} - Missed (Click to backfill)`}
                onClick={() => setSelectedDate(day.localDay)}
                className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors"
              />
            );
          })}
        </div>
      </div>

      <BackfillModal
        localDay={selectedDate || ""}
        isOpen={!!selectedDate}
        loading={loading}
        error={error}
        onClose={() => {
          setSelectedDate(null);
          setError(null);
        }}
        onConfirm={handleBackfill}
      />
    </div>
  );
}
