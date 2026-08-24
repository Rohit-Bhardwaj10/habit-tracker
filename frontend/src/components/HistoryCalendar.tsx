"use client";

import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import BackfillModal from "./BackfillModal";

type CheckIn = {
  id: string;
  localDay: string;
};

type HistoryCalendarProps = {
  habitId: string;
  createdAt: string;
  checkIns: CheckIn[];
  userTimezone: string;
  onCheckInSuccess: () => void;
};

export default function HistoryCalendar({
  habitId,
  createdAt,
  checkIns,
  userTimezone,
  onCheckInSuccess,
}: HistoryCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const checkInMap = useMemo(() => {
    const map = new Set<string>();
    checkIns.forEach((c) => map.add(c.localDay));
    return map;
  }, [checkIns]);

  const days = useMemo(() => {
    const result = [];
    const today = DateTime.now().setZone(userTimezone).startOf("day");
    
    const habitCreatedDate = DateTime.fromISO(createdAt, { zone: userTimezone }).startOf("day");

    // 365 days
    for (let i = 364; i >= 0; i--) {
      const current = today.minus({ days: i });
      const localDay = current.toISODate();
      if (!localDay) continue;

      const isCheckedIn = checkInMap.has(localDay);
      const isBeforeCreation = current < habitCreatedDate;
      const isToday = i === 0;

      result.push({
        date: localDay,
        isCheckedIn,
        isBeforeCreation,
        isToday,
      });
    }
    return result;
  }, [createdAt, checkIns, userTimezone, checkInMap]);

  return (
    <div>
      <div className="flex gap-[4px] overflow-x-auto pb-4 no-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-[4px] mx-auto min-w-max">
          {days.map((day) => {
            let bgColorClass = "bg-rose-200"; // default empty (missed)
            let hoverClass = "hover:ring-2 hover:ring-rose-400 cursor-pointer hover:-translate-y-0.5 z-10";
            
            if (day.isBeforeCreation) {
              bgColorClass = "bg-slate-200"; // deeply faded (past)
              hoverClass = "cursor-not-allowed opacity-60";
            } else if (day.isCheckedIn) {
              bgColorClass = "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]";
              hoverClass = "cursor-default"; // No hover effect if already checked in
            } else if (day.isToday) {
              bgColorClass = "bg-slate-100 ring-1 ring-slate-400";
            }

            return (
              <div
                key={day.date}
                title={`${day.date}${day.isCheckedIn ? " - Done" : ""}${day.isBeforeCreation ? " - Before Creation" : ""}`}
                className={`w-3 h-3 rounded-[3px] transition-all duration-200 relative ${bgColorClass} ${hoverClass}`}
                onClick={() => {
                  if (!day.isBeforeCreation && !day.isCheckedIn) {
                    setSelectedDate(day.date);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-slate-200 opacity-60"></div> Past</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-rose-200"></div> Missed</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div> Checked In</span>
      </div>

      {selectedDate && (
        <BackfillModal
          habitId={habitId}
          localDay={selectedDate}
          onClose={() => setSelectedDate(null)}
          onConfirm={() => {
            setSelectedDate(null);
            onCheckInSuccess();
          }}
        />
      )}
    </div>
  );
}
