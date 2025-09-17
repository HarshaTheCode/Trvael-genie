import { Link, useLocation } from 'react-router-dom';
import { Icons } from '../components/ui/icons';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { UserNav } from '../components/UserNav';

export function MainNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/app', icon: Icons.home },
    { name: 'Plans', href: '/saved-plans', icon: Icons.bookmark },
    { name: 'Explore', href: '/explore', icon: Icons.compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link to="/app" className="flex items-center space-x-2">
            <Icons.compass className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">TravelBuilder</span>
          </Link>
          <nav className="hidden items-center space-x-4 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="mr-1 h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="hidden sm:inline-flex">
                  Sign in
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup" className="hidden sm:inline-flex">
                  Get started
                </Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Icons.menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', href: '/app', icon: Icons.home },
    { name: 'Plans', href: '/saved-plans', icon: Icons.bookmark },
    { name: 'Explore', href: '/explore', icon: Icons.compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
        {isAuthenticated ? (
          <Link
            to="/profile"
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium',
              location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icons.user
              className={cn(
                'h-5 w-5 mb-1',
                location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            />
            <span>Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium text-muted-foreground"
          >
            <Icons.login className="h-5 w-5 mb-1" aria-hidden="true" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
