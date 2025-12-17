import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, User, LogOut, ShoppingCart, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:4000';

interface Event {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  imageUrl: string;
  _count?: { tickets: number };
}

interface Booking {
  id: string;
  status: string;
  total: number;
  expiresAt?: string;
  createdAt: string;
  items: BookingItem[];
}

interface BookingItem {
  id: string;
  price: number;
  ticket: {
    id: string;
    event: {
      title: string;
    };
  };
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

const App = () => {
  const [currentView, setCurrentView] = useState('events');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableTicketsCount, setAvailableTicketsCount] = useState<Record<string, number>>({});
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({});
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qtyByEvent, setQtyByEvent] = useState<Record<string, number>>({});
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    imageUrl: '',
  });
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string>('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: ''
  });

  const [ticketForm, setTicketForm] = useState({
    eventId: '',
    price: '',
    quantity: ''
  });


  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
      fetchEvents();
    }
  }, []);

  const openEdit = (ev: any) => {
    setEditingEvent(ev);
  
    setEditForm({
      title: ev.title ?? '',
      description: ev.description ?? '',
      startAt: ev.startAt ? ev.startAt.slice(0, 16) : '', // datetime-local
      endAt: ev.endAt ? ev.endAt.slice(0, 16) : '',
      imageUrl: ev.imageUrl ?? '',
    });
  
    setEditFile(null);
    setEditPreview(ev.imageUrl ?? '');
  };
  const closeEdit = () => {
    setEditingEvent(null);
    setEditFile(null);
    setEditPreviewUrl('');
  };

  const updateEvent = async (eventId: string, payload: any) => {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  };
  
  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    setLoading(true);
    try {
      // 1) update fields (không cần imageUrl)
      await updateEvent(editingEvent.id, {
        title: editForm.title,
        description: editForm.description,
        startAt: editForm.startAt ? new Date(editForm.startAt).toISOString() : undefined,
        endAt: editForm.endAt ? new Date(editForm.endAt).toISOString() : undefined,
      });
  
      // 2) nếu có file mới thì upload
      if (editFile) {
        await uploadEventImage(editingEvent.id, editFile);
      } else {
        await fetchEvents();
      }
  
      setEditingEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEventImage(file);
  
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const data = await res.json();
      setEvents(data);
      // Fetch available tickets count for each event
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (event: Event) => {
          const count = await countAvailableTickets(event.id);
          if (count !== null) {
            counts[event.id] = count;
          }
        })
      );
      setAvailableTicketsCount(counts);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };
  
  const countAvailableTickets = async (eventId: string): Promise<number | null> => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/available-tickets`);
      if (res.ok) {
        const data = await res.json();
        return data.availableTickets;
      }
      return null;
    } catch (err) {
      console.error('Failed to count available tickets:', err);
      return null;
    }
  }

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        setUser(data.user);
        setEmail('');
        setPassword('');
        fetchEvents();
      } else {
        alert('Authentication failed');
      }
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('events');
  };


  const handleCreateEvent = async () => {
    try {
      setLoading(true);
  
      // 1. Create event trước
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      });
  
      if (!res.ok) throw new Error('Create event failed');
  
      const createdEvent = await res.json();
  
      // 2. Upload image nếu có
      if (eventImage) {
        await uploadEventImage(createdEvent.id, eventImage);
      }
  
      // 3. Reset form
      setNewEvent({
        title: '',
        description: '',
        startAt: '',
        endAt: '',
      });
      setEventImage(null);
      setPreviewUrl(null);
  
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCreateTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: ticketForm.eventId,
          price: parseInt(ticketForm.price),
          quantity: parseInt(ticketForm.quantity)
        })
      });
      
      if (res.ok) {
        alert('Tickets created successfully!');
        setTicketForm({ eventId: '', price: '', quantity: '' });
        fetchEvents();
      } else {
        alert('Failed to create tickets');
      }
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return;
  
    const ok = window.confirm('Bạn chắc chắn muốn xoá event này chứ?');
    if (!ok) return;
  
    try {
      setLoading(true);
  
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ DELETE không gửi body thì KHÔNG cần Content-Type
        },
      });
  
      if (res.ok) {
        alert('Xoá event thành công!');
        await fetchEvents(); // refresh lại list events + availableTicketsCount
  
        // (tuỳ chọn) dọn state liên quan
        setAvailableTicketsCount((prev) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
  
        // nếu bạn có qtyByEvent
        setQtyByEvent?.((prev: any) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Xoá event thất bại: ' + (err.message || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHoldTicket = async (eventId: string, quantity: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/bookings/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, quantity })
      });
      
      if (res.ok) {
        alert('Ticket held successfully! Check your bookings.');
        fetchBookings();
        // Refresh available tickets count for this event
        const count = await countAvailableTickets(eventId);
        if (count !== null) {
          setAvailableTicketsCount(prev => ({ ...prev, [eventId]: count }));
        }
      } else {
        const error = await res.json();
        alert('Failed to hold ticket: ' + (error.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Payment successful!');
        fetchBookings();
      } else {
        alert('Payment failed');
      }
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const uploadEventImage = async (eventId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
  
    const res = await fetch(`${API_BASE}/events/${eventId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // nếu endpoint cần auth
      body: form,
    });
  
    if (!res.ok) throw new Error('Upload failed');
    await fetchEvents(); // reload để có imageUrl mới
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Ticket className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Ticket Booking</h1>
            <p className="text-gray-600 mt-2">Book your event tickets easily</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === 'login'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === 'register'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">Ticket Booking</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.email}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

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
              onClick={() => {
                setCurrentView('bookings');
                fetchBookings();
              }}
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'events' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
                const available = availableTicketsCount[event.id] ?? 0;
                const qty = qtyByEvent[event.id] ?? 1;

                const isQtyValid = Number.isFinite(qty) && qty >= 1 && qty <= available;
                const canBook = !loading && available > 0 && isQtyValid;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-[16/9] bg-gray-200">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.startAt).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          <span>{available} tickets available</span>
                        </div>

                        {/* ✅ 3️⃣ Trong card Event: thêm input chọn số lượng */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <label className="text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, available)}
                            value={qty}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const nextVal = raw === '' ? 1 : parseInt(raw, 10);

                              // clamp
                              const clamped =
                                available > 0
                                  ? Math.max(1, Math.min(nextVal, available))
                                  : 1;

                              setQtyByEvent((prev) => ({
                                ...prev,
                                [event.id]: Number.isFinite(clamped) ? clamped : 1
                              }));
                            }}
                            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                            disabled={available === 0}
                          />
                        </div>

                        {!isQtyValid && available > 0 && (
                          <div className="text-xs text-red-600">
                            Quantity must be between 1 and {available}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleHoldTicket(event.id, qty)}
                        disabled={!canBook}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {available === 0 ? 'Sold Out' : 'Book Ticket'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            booking.status === 'HOLD' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'HOLD' && booking.expiresAt && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Expires: {new Date(booking.expiresAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-purple-600">${booking.total}</p>
                      </div>
                      {booking.status === 'HOLD' && (
                        <button
                          onClick={() => handlePayBooking(booking.id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Pay Now
                        </button>
                      )}                     
                    </div>
                    <button
                        onClick={() =>
                          setExpandedBookings(prev => ({
                            ...prev,
                            [booking.id]: !prev[booking.id]
                          }))
                        }
                        className="ml-4 w-8 h-8 flex items-center justify-center rounded-full border text-lg font-bold hover:bg-gray-100"
                      >
                        {expandedBookings[booking.id] ? '−' : '+'}
                      </button>
                  </div>
                  {expandedBookings[booking.id] && (
                    <div className="space-y-2 mt-4">
                      {booking.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-t"
                        >
                          <span className="font-medium">
                            {item.ticket.event.title}
                          </span>
                          <span className="text-gray-600">
                            ${item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No bookings yet. Book some tickets!
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'admin' && user?.role === 'ADMIN' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Create New Event</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.startAt}
                      onChange={(e) => setNewEvent({ ...newEvent, startAt: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.endAt}
                      onChange={(e) => setNewEvent({ ...newEvent, endAt: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                </div>
                {/* Upload image */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Event Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 w-full h-48 object-cover rounded-lg border"
                    />
                  )}
                </div>
                <button
                  onClick={handleCreateEvent}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  Create Event
                </button>
              </div>
            </div>
            {editingEvent && (
            <div className="mt-6 rounded-xl border p-4 bg-gray-50">
              <h3 className="font-bold mb-3">Edit: {editingEvent.title}</h3>

              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                />

                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={editForm.startAt}
                    onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                  />
                  <input
                    type="datetime-local"
                    value={editForm.endAt}
                    onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Event Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} />
                  {editPreview && (
                    <img src={editPreview} className="w-full h-48 object-cover rounded-lg border" />
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingEvent(null)}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gray-300 font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Create Tickets for Event</h2>
              <div className="space-y-4">
                <select
                  value={ticketForm.eventId}
                  onChange={(e) => setTicketForm({ ...ticketForm, eventId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="">Select Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price ($)"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={ticketForm.quantity}
                    onChange={(e) => setTicketForm({ ...ticketForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    min="1"
                  />
                </div>
                <button
                  onClick={handleCreateTickets}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  Create Tickets
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Manage Events</h2>

            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  {/* LEFT */}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{ev.title}</p>
                    <p className="text-sm text-gray-600 truncate">{ev.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(ev.startAt).toLocaleString()} → {new Date(ev.endAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => openEdit(ev)}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </div>
                  {/* RIGHT (nút bên phải) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                    
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-sm text-gray-500">Chưa có event nào.</div>
              )}
            </div>
          </div>
        </div>
        )}
        
      </main>
    </div>
    
  );
};

export default App;