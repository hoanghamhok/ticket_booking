import { useState, useEffect } from 'react';
import { bookingService } from '../api/services/bookingService';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const payBooking = async (bookingId) => {
    try {
      await bookingService.payBooking(bookingId);
      await fetchBookings(); // Refresh list
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Payment failed' 
      };
    }
  };

  return { bookings, loading, error, refetch: fetchBookings, payBooking };
};