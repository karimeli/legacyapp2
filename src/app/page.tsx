// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Esto fuerza a la app a ir directamente al login al abrir http://localhost:3000
  redirect("/login/page");
}