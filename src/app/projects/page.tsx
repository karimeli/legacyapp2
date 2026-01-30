"use client";
import { api } from "@/trpc/react";
import { useState } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const utils = api.useUtils();
  const { data: projects } = api.task.getAllProjects.useQuery();
  const create = api.task.createProject.useMutation({
    onSuccess: () => { setName(""); void utils.task.getAllProjects.invalidate(); }
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-black">Proyectos</h1>
        <Link href="/task" className="text-blue-600 font-bold">Volver</Link>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if(name) create.mutate({ name }); }} className="flex gap-2 mb-8">
        <input className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre del proyecto..." value={name} onChange={e => setName(e.target.value)} />
        <button className="bg-slate-900 text-white px-8 rounded-xl font-bold">Crear</button>
      </form>
      <div className="grid gap-4">
        {projects?.map(p => (
          <div key={p.id} className="p-6 bg-white border rounded-3xl flex justify-between shadow-sm">
            <span className="font-bold text-slate-800">{p.name}</span>
            <span className="text-slate-400 text-sm font-bold">{p._count.tasks} Tareas</span>
          </div>
        ))}
      </div>
    </div>
  );
}