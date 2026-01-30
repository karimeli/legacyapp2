"use client";
import { api } from "@/trpc/react";
import { useState } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const utils = api.useUtils();
  const { data: projects, isLoading } = api.task.getAllProjects.useQuery();

  const create = api.task.createProject.useMutation({
    onSuccess: () => {
      setName("");
      void utils.task.getAllProjects.invalidate();
      void utils.task.getReportData.invalidate();
    }
  });

  const remove = api.task.deleteProject.useMutation({
    onSuccess: () => {
      void utils.task.getAllProjects.invalidate();
      void utils.task.getReportData.invalidate();
    },
    onError: () => alert("No puedes borrar un proyecto con tareas activas.")
  });

  if (isLoading) return <div className="p-10 text-center">Cargando proyectos...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Proyectos</h1>
        <Link href="/task" className="text-blue-600 font-bold">← Panel</Link>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); if(name) create.mutate({ name }); }} className="flex gap-2 mb-10">
        <input 
          className="flex-1 border border-slate-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          placeholder="Nombre del nuevo proyecto..." 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <button type="button" disabled={create.isPending} className="bg-slate-900 text-white px-8 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50">
          {create.isPending ? "..." : "Crear"}
        </button>
      </form>

      <div className="grid gap-4">
        {projects?.map(p => (
          <div key={p.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex justify-between items-center shadow-sm hover:shadow-md transition-all">
            <div>
              <span className="font-bold text-slate-800 text-lg">{p.name}</span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{p._count.tasks} Tareas</p>
            </div>
            <button type="button" title="Eliminar proyecto" onClick={() => confirm("¿Borrar?") && remove.mutate({ id: p.id })} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}