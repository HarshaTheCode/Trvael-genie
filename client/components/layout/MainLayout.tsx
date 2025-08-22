import { Outlet } from 'react-router-dom';
import { MainNav } from '@/components/MainNav';
import { MobileNav } from '@/components/MainNav';
import { useLocation } from 'react-router-dom';

export function MainLayout() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/auth/verify'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';
  const showNav = !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col">
      {showNav && <MainNav />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
