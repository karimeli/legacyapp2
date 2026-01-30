"use client";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function TaskPage() {
  const { data: tasks, isLoading } = api.task.getAll.useQuery();

  if (isLoading) return <div className="p-8 text-center">Cargando tareas...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-800">Mis Tareas</h1>
        <Link 
          href="/task/new" 
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          + Nueva Tarea
        </Link>
      </div>

      <div className="grid gap-4">
        {tasks?.map((task) => (
          <div 
            key={task.id} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{task.title}</h3>
              <p className="text-slate-500 text-sm">{task.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                  {task.priority}
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-blue-50 rounded-md text-blue-600">
                  {task.status}
                </span>
              </div>
            </div>
            {/* Se eliminó el Link que iba a /task/[id] */}
          </div>
        ))}
      </div>
    </div>
  );
}