"use client";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function ReportsPage() {
  // Obtenemos los datos con la estructura correcta del backend
  const { data: report, isLoading } = api.task.getReportData.useQuery();

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Generando métricas...</div>;
  
  // Protección por si report es undefined
  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-subtle">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-slate-900">Reportes</h1>
        <Link href="/task" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Volver</Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total de Tareas */}
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
          <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mb-2">Total Tareas</p>
          <h2 className="text-5xl font-black">{report.total}</h2>
        </div>

        {/* Tareas Pendientes */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Pendientes</p>
          <h2 className="text-5xl font-black text-slate-800">{report.pending}</h2>
        </div>

        {/* Tareas Completadas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Completadas</p>
          <h2 className="text-5xl font-black text-slate-800">{report.done}</h2>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8 text-slate-800">Distribución de Proyectos</h3>
        <div className="space-y-6">
          {/* Iteramos sobre 'byProject' en lugar de 'projects' */}
          {report.byProject.map(p => (
            <div key={p.name}>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700">{p.name}</span>
                {/* Usamos _count.tasks en lugar de count */}
                <span className="text-slate-400">{p._count.tasks} tareas</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-1000 progress-bar"
                  // Calculamos el ancho de la barra
                  style={{ width: `${(p._count.tasks / (report.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}