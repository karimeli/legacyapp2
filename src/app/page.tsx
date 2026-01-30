import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirige a la ruta /login (src/app/login/page.tsx)
  redirect("/login"); 
}