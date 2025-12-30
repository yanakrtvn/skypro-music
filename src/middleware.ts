
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Пока просто пропускаем все запросы
  return NextResponse.next();
}

// Опционально: матчер для определенных путей
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};