import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay sesión y no está en login, redirigir al login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene sesión e intenta ir al login, mandarlo a tareas
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/task', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege todas las rutas excepto archivos estáticos y API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};