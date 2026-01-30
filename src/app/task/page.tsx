"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { CommentSection } from "./_components/CommentSection";
import { HistorySection } from "./_components/HistorySection";
import { LogoutButton } from "./_components/LogoutButton";

export default function TaskPage() {
  const utils = api.useUtils();
  const { data: tasks, isLoading } = api.task.getAll.useQuery();

  const updateStatus = api.task.updateStatus.useMutation({ 
    onSuccess: () => {
      void utils.task.getAll.invalidate();
      void utils.task.getReportData.invalidate();
    }
  });

  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
      void utils.task.getReportData.invalidate();
    }
  });

  if (isLoading) return <div className="p-10 text-center font-bold">Cargando aplicación...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 animate-subtle">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter">LegacyApp 2.0</h1>
        <nav className="flex items-center gap-3">
          <Link href="/search" className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50 transition-all">Buscar</Link>
          <Link href="/reports" className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50 transition-all">Reportes</Link>
          <Link href="/projects" className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50 transition-all">Proyectos</Link>
          <Link href="/task/new" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all">+ Tarea</Link>
          <LogoutButton />
        </nav>
      </header>

      <div className="grid gap-8">
        {tasks?.map(task => (
          <div key={task.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">{task.project.name}</span>
                  <select 
                    value={task.status} 
                    onChange={e => updateStatus.mutate({ id: task.id, status: e.target.value })}
                    className="text-[10px] font-bold border border-slate-200 rounded-full px-3 py-1 outline-none bg-white"
                    title="Cambiar estado de la tarea"
                    aria-label="Cambiar estado de la tarea"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>
                <button type="button" onClick={() => confirm("¿Eliminar?") && deleteTask.mutate({ id: task.id })} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Eliminar tarea" aria-label="Eliminar tarea">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${task.status === "Completada" ? "text-slate-300 line-through" : "text-slate-800"}`}>{task.title}</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">{task.description}</p>
              <CommentSection taskId={task.id} />
            </div>
            <div className="lg:w-80 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <HistorySection taskId={task.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}