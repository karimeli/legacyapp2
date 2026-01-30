"use client";
import { api } from "@/trpc/react";

export function HistorySection({ taskId }: { taskId: number }) {
  const { data: history, isLoading } = api.task.getHistory.useQuery({ taskId });

  if (isLoading) return <p className="text-[10px] text-slate-400">Cargando historial...</p>;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Historial de actividad</h4>
      <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {history?.map((h) => (
          <div key={h.id} className="relative pl-6 text-xs">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-700">
                {h.action === "CAMBIO_ESTADO" ? (
                  <>Estado: <span className="text-slate-400 font-normal">{h.oldValue}</span> → <span className="text-blue-600">{h.newValue}</span></>
                ) : (
                  h.action + ": " + h.newValue
                )}
              </span>
              <span className="text-[9px] text-slate-400">
                {new Date(h.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}