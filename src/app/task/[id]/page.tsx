"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";

const STATUS_OPTIONS = ["Pendiente", "En Progreso", "Completada", "Cancelada"];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = params.id ? parseInt(String(params.id), 10) : NaN;
  
  const { data: task, isLoading, isError, refetch } = api.task.getById.useQuery(
    { id },
    { enabled: !isNaN(id) }
  );

  const [commentText, setCommentText] = useState("");

  const statusMutation = api.task.updateStatus.useMutation({ onSuccess: () => refetch() });
  const commentMutation = api.task.addComment.useMutation({ 
    onSuccess: () => { setCommentText(""); refetch(); } 
  });

  if (isLoading) return <div className="p-10 text-center">Cargando detalle...</div>;
  if (isError || isNaN(id)) return <div className="p-10 text-center">Error: Tarea inválida o no encontrada.</div>;
  if (!task) return <div className="p-10 text-center">Tarea no encontrada</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-blue-600 mb-4">← Volver</button>
            <span className="text-xs font-mono text-slate-400">ID: #{task.id}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
          <p className="text-slate-600 leading-relaxed mb-6">{task.description || "Sin descripción"}</p>
          
          <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label htmlFor="task-status-select" className="block text-xs font-bold text-slate-400 uppercase">Estado</label>
              <select
                id="task-status-select"
                value={task.status}
                onChange={(e) => statusMutation.mutate({ id: task.id, status: e.target.value })}
                disabled={statusMutation.isPending}
                className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Prioridad</label>
              <span className="font-medium text-slate-700">{task.priority}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase">Proyecto</label>
              <span className="font-medium text-slate-700">{task.project?.name ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Comentarios</h3>
          <div className="flex gap-2 mb-6">
            <input 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Escribe una nota..."
              className="flex-1 border border-slate-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
            />
            <button 
              onClick={() => commentMutation.mutate({ taskId: task.id, text: commentText })}
              disabled={commentMutation.isPending || !commentText.trim()}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {commentMutation.isPending ? "Enviando..." : "Enviar"}
            </button>
          </div>
          
          <div className="space-y-4">
            {task.comments?.map(c => (
              <div key={c.id} className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-800 text-sm">{c.text}</p>
                <p className="text-xs text-slate-400 mt-2 text-right">{c.createdAt.toLocaleString()}</p>
              </div>
            ))}
            {task.comments?.length === 0 && <p className="text-slate-400 italic text-sm">No hay comentarios aún.</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Historial de Cambios</h3>
          <div className="space-y-6 relative pl-2">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100"></div>
            {task.history?.map(h => (
              <div key={h.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full z-10"></div>
                <p className="text-xs font-bold text-slate-700 uppercase mb-1">{h.action}</p>
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="line-through text-red-300 block">{h.oldValue ?? '(vacío)'}</span>
                  <span className="text-green-600 font-bold block">↓ {h.newValue ?? '(vacío)'}</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 text-right">{h.timestamp.toLocaleString()}</p>
              </div>
            ))}
            {task.history?.length === 0 && <p className="text-slate-400 italic text-sm">No hay historial de cambios.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}