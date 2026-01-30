"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ReportsPage() {
  // Make sure getReportData exists in your API, or replace with the correct method
  const { data: report, isLoading } = api.task.getReportData?.useQuery
    ? api.task.getReportData.useQuery()
    : { data: undefined, isLoading: false };

  if (isLoading) return <div className="p-10 text-center font-bold">Generando reporte...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-slate-900">Reportes y Métricas</h1>
        <Link href="/task" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Volver</Link>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
          <p className="text-blue-100 font-bold uppercase text-xs tracking-widest mb-2">Total Tareas</p>
          <h2 className="text-5xl font-black">{report?.totalTasks}</h2>
        </div>
        
        {report?.statusStats.map((stat: { status: string; _count: { id: number } }) => (
          <div key={stat.status} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">{stat.status}</p>
            <h2 className="text-5xl font-black text-slate-800">{stat._count.id}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Distribución por Proyectos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Carga por Proyecto</h3>
          <div className="space-y-4">
            {report?.projectStats.map((p: { name: string; count: number }) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{p.name}</span>
                  <span className="text-slate-400">{p.count} tareas</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`bg-blue-500 h-full transition-all duration-1000 report-bar-${p.name.replace(/\s+/g, '-').toLowerCase()}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
          <h3 className="text-xl font-bold mb-4">Análisis de Productividad</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            El sistema detecta que tienes mayor actividad en el estado 
            <span className="text-blue-400 font-bold"> {report?.statusStats[0]?.status || "N/A"}</span>. 
            Recuerda registrar tus avances en la sección de comentarios para mantener el historial actualizado.
          </p>
        </div>
      </div>
    </div>
  );
}