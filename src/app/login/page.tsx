"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Validamos contra tu variable de entorno (aquí hardcodeada para el ejemplo)
    if (password === "admin123") {
      // 1. Creamos la cookie de sesión
      document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax";
      
      // 2. Redirigimos a la carpeta /tasks
      router.push("/tasks");
      // Forzamos un refresco para que el middleware detecte la nueva cookie
      router.refresh(); 
    } else {
      alert("Acceso denegado: Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl font-black">L</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">LegacyApp 2.0</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa la contraseña maestra</p>
        </div>

        <div className="space-y-6">
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}