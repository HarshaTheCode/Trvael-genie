import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

export function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', href: '/app', icon: Icons.home },
    { name: 'Plans', href: '/saved-plans', icon: Icons.bookmark },
    { name: 'Explore', href: '/explore', icon: Icons.compass },
    { name: 'Profile', href: '/profile', icon: Icons.user },
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
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-hidden="true"
              />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
