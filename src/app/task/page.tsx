"use client";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function TasksDashboard() {
  const { data: tasks, isLoading } = api.task.getAll.useQuery();

  if (isLoading) return <div className="p-10 text-center">Cargando tareas...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Tareas</h1>
          <p className="text-slate-500">Gestión de proyectos y seguimiento</p>
        </div>
        <Link 
          href="/task/new" 
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          + Nueva Tarea
        </Link>
      </header>

      <div className="grid gap-4">
        {tasks?.map((task) => (
          <Link key={task.id} href={`/task/${task.id}`}>
            <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition">{task.title}</h2>
                <div className="flex gap-3 text-sm text-slate-500 mt-1">
                  <span>📂 {task.project?.name}</span>
                  <span>📅 {task.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  task.priority === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {task.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  task.status === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}