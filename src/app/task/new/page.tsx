"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function NewTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    priority: "Media", 
    projectId: undefined as number | undefined 
  });
  
  const { data: projects } = api.task.getProjects.useQuery();
  
  // Si cargan los proyectos y no hay uno seleccionado, tomamos el primero
  useEffect(() => {
    if (projects && projects.length > 0 && !formData.projectId) {
      setFormData(prev => ({ ...prev, projectId: projects[0]?.id }));
    }
  }, [projects]);

  const createMutation = api.task.create.useMutation({
    onSuccess: () => router.push("/task")
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      projectId: formData.projectId && formData.projectId > 0 ? formData.projectId : undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Crear Nueva Tarea</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input 
            required
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="Ingrese el título de la tarea"
            title="Título de la tarea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Ingrese la descripción de la tarea"
            title="Descripción de la tarea"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
              title="Prioridad de la tarea"
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={formData.projectId ?? ""}
              onChange={e => {
                const v = e.target.value;
                setFormData(prev => ({ ...prev, projectId: v === "" ? undefined : Number(v) }));
              }}
              title="Proyecto asociado"
            >
              {(!projects || projects.length === 0) && <option value="">Crear automáticamente...</option>}
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Error al crear la tarea: {createMutation.error.message}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Guardando..." : "Crear Tarea"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-slate-300 rounded-lg font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}