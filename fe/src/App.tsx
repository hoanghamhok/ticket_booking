import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';
import BookingsPage from './pages/BookingsPage';
import AdminPage from './pages/AdminPage';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';

const App = () => {
  const { token, user } = useAuth();
  const [currentView, setCurrentView] = useState('events');

  if (!token) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'events' && <EventsPage />}
        {currentView === 'bookings' && <BookingsPage />}
        {currentView === 'admin' && user?.role === 'ADMIN' && <AdminPage />}
      </main>
    </div>
  );
};

export default App;