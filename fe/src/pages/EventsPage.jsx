import React, { useState } from 'react';
import { Calendar, Ticket } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { bookingService } from '../api/services/bookingService';

const EventsPage = () => {
  const { events, availableTickets, loading, refetch } = useEvents();
  const [quantities, setQuantities] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookTicket = async (eventId) => {
    const quantity = quantities[eventId] || 1;
    setBookingLoading(true);
    try {
      await bookingService.holdTicket(eventId, quantity);
      alert('Ticket held successfully!');
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to hold ticket');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const available = availableTickets[event.id] || 0;
          const qty = quantities[event.id] || 1;

          return (
            <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="aspect-[16/9] bg-gray-200">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.startAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    {available} tickets available
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={available}
                      value={qty}
                      onChange={(e) => setQuantities(prev => ({
                        ...prev,
                        [event.id]: Math.max(1, Math.min(parseInt(e.target.value) || 1, available))
                      }))}
                      className="w-24 px-3 py-2 rounded border"
                      disabled={available === 0}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleBookTicket(event.id)}
                  disabled={bookingLoading || available === 0}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {available === 0 ? 'Sold Out' : 'Book Ticket'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;