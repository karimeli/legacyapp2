import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Buscamos la cookie que crearemos en el login
  const authCookie = request.cookies.get('admin_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay cookie y el usuario no está en el login, lo bloqueamos
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene la cookie e intenta ir al login, lo mandamos a tasks
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

// Protegemos todas las rutas excepto archivos estáticos y la API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};