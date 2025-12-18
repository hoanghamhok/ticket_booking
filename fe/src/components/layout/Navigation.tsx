import React from 'react';
import { Calendar, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navigation = ({ currentView, setCurrentView }: NavigationProps) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentView('events')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              currentView === 'events'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Events
          </button>
          <button
            onClick={() => setCurrentView('bookings')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              currentView === 'bookings'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            My Bookings
          </button>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                currentView === 'admin'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;