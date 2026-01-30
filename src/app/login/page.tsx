"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // En una app real, esto sería una llamada API segura.
    // Aquí simulamos guardando la cookie para el middleware.
    document.cookie = `admin_session=true; path=/; max-age=86400; SameSite=Lax`;
    
    // Validación simple en cliente (la real la hace el middleware/backend)
    if (password === "admin123") {
      router.push("/tasks");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-slate-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">LegacyApp Login</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Contraseña de Admin</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}