import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';

const BookingsPage = () => {
  const { bookings, loading, payBooking } = useBookings();
  const [expanded, setExpanded] = useState({});

  const handlePay = async (bookingId) => {
    const result = await payBooking(bookingId);
    if (result.success) {
      alert('Payment successful!');
    } else {
      alert(result.error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  booking.status === 'HOLD' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </span>
                {booking.expiresAt && (
                  <span className="text-sm text-gray-600 ml-2">
                    <Clock className="w-4 h-4 inline" />
                    Expires: {new Date(booking.expiresAt).toLocaleString()}
                  </span>
                )}
                <p className="text-2xl font-bold text-purple-600 mt-2">${booking.total}</p>
                {booking.status === 'HOLD' && (
                  <button
                    onClick={() => handlePay(booking.id)}
                    className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Pay Now
                  </button>
                )}
              </div>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [booking.id]: !prev[booking.id] }))}
                className="w-8 h-8 rounded-full border font-bold hover:bg-gray-100"
              >
                {expanded[booking.id] ? '−' : '+'}
              </button>
            </div>
            
            {expanded[booking.id] && (
              <div className="mt-4 space-y-2">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-t">
                    <span>{item.ticket.event.title}</span>
                    <span>${item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">No bookings yet</div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;