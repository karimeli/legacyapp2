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
  
  const { data: projects, isLoading } = api.task.getProjects.useQuery();
  
  // Pre-seleccionar el primer proyecto cuando carguen los datos
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

    // 1. VALIDACIÓN: Si no hay proyecto, detenemos el envío y avisamos.
    if (!formData.projectId) {
      alert("Debes seleccionar un proyecto obligatoriamente.");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      // 2. CORRECCIÓN DE TIPO: Al pasar la validación anterior, TypeScript ya sabe que esto es un número.
      projectId: formData.projectId, 
    });
  };

  if (isLoading) return <div className="p-10 text-center">Cargando formulario...</div>;

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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Ingrese la descripción de la tarea"
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
            <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
            <select 
              id="project"
              required
              className="w-full border p-2 rounded-lg"
              value={formData.projectId ?? ""}
              onChange={e => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, projectId: val ? Number(val) : undefined }));
              }}
            >
              <option value="">Seleccione un proyecto...</option>
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Error: {createMutation.error.message}
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