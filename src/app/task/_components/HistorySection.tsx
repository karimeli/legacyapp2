"use client";
import { api } from "@/trpc/react";

export function HistorySection({ taskId }: { taskId: number }) {
  const { data: history } = api.task.getHistory.useQuery({ taskId });

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad Reciente</h4>
      <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {history?.map(h => (
          <div key={h.id} className="relative pl-6">
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
            <p className="text-[11px] font-bold text-slate-700">{h.action}: <span className="font-medium text-slate-500">{h.newValue}</span></p>
            <span className="text-[9px] text-slate-300">{new Date(h.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}