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
    onSuccess: () => void utils.task.getAll.invalidate() 
  });
  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => void utils.task.getAll.invalidate()
  });

  if (isLoading) return <div className="p-10 text-center font-bold">Cargando LegacyApp...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter">LegacyApp 2.0</h1>
        <nav className="flex items-center gap-4">
          <Link href="/search" className="px-4 py-2 border rounded-xl font-bold">Buscar</Link>
          <Link href="/reports" className="px-4 py-2 border rounded-xl font-bold">Reportes</Link>
          <Link href="/projects" className="px-4 py-2 border rounded-xl font-bold">Proyectos</Link>
          <Link href="/task/new" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">+ Tarea</Link>
          <LogoutButton />
        </nav>
      </header>

      <div className="grid gap-8">
        {tasks?.map(task => (
          <div key={task.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 shadow-sm">
            <div className="flex-1">
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">{task.project.name}</span>
                  <select 
                    value={task.status} 
                    onChange={e => updateStatus.mutate({ id: task.id, status: e.target.value })}
                    className="text-[10px] font-bold border rounded-full px-3"
                    aria-label="Task status"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>
                <button type="button" onClick={() => confirm("¿Eliminar?") && deleteTask.mutate({ id: task.id })} className="text-slate-300 hover:text-red-500">
                  🗑️
                </button>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${task.status === "Completada" ? "text-slate-300 line-through" : ""}`}>{task.title}</h2>
              <p className="text-slate-500 mb-6">{task.description}</p>
              <CommentSection taskId={task.id} />
            </div>
            <div className="lg:w-80 bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <HistorySection taskId={task.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}