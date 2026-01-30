"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function NewTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", description: "", priority: "Media", projectId: 1 });
  
  // Obtenemos proyectos para el select
  const { data: projects } = api.task.getProjects.useQuery();
  
  const createMutation = api.task.create.useMutation({
    onSuccess: () => router.push("/task") // Redirigir al dashboard al terminar
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      projectId: Number(formData.projectId)
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Crear Nueva Tarea</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input 
            id="title"
            required
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea 
            id="description"
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select 
              id="priority"
              className="w-full border p-2 rounded-lg"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </div>
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
            <select 
              id="projectId"
              className="w-full border p-2 rounded-lg"
              value={formData.projectId}
              onChange={e => setFormData({...formData, projectId: Number(e.target.value)})}
            >
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Guardando..." : "Crear Tarea"}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}