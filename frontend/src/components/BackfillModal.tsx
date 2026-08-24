"use client";

import { X } from "lucide-react";

type BackfillModalProps = {
  localDay: string;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function BackfillModal({
  localDay,
  isOpen,
  loading,
  error,
  onClose,
  onConfirm,
}: BackfillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800">Backfill Check-in</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 mb-6">
            Are you sure you want to log a check-in for <span className="font-semibold text-slate-800">{localDay}</span>?
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg disabled:opacity-70 transition-colors"
            >
              {loading ? "Confirming..." : "Confirm Check-in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
