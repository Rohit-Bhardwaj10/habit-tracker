export default function SkeletonHabitCard() {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/40 shadow-sm relative overflow-hidden h-[184px]">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      <div className="flex justify-between items-start mb-5">
        <div className="w-full">
          <div className="h-6 bg-slate-200/60 rounded-md w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200/50 rounded-md w-1/2"></div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 bg-slate-200/60 rounded-lg w-28"></div>
        <div className="h-8 bg-slate-200/60 rounded-lg w-24"></div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-12 bg-slate-200/60 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
