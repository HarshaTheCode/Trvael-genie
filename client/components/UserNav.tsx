
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function UserNav() {

  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userInitials = user.email
    ? user.email
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const userEmail = user.email || 'user@example.com';
  const userName = user.user_metadata?.name || 'User';

  return (
    <div className="relative inline-block text-left">
      <button
        className="relative h-8 w-8 rounded-full border bg-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-full text-lg font-bold">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt={userName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            userInitials
          )}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="py-1">
            <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <span className="mr-2">👤</span>
              Profile
            </Link>
            <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
          </div>
          <div className="border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <span className="mr-2">🚪</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
