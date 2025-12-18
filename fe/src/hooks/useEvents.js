import { useState, useEffect } from 'react';
import { eventService } from '../api/services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [availableTickets, setAvailableTickets] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventService.getAll();
      setEvents(data);
      
      // Fetch available tickets cho từng event
      const tickets = {};
      await Promise.all(
        data.map(async (event) => {
          try {
            const { data: ticketData } = await eventService.getAvailableTickets(event.id);
            tickets[event.id] = ticketData.availableTickets;
          } catch (err) {
            console.error(`Failed to fetch tickets for event ${event.id}`);
          }
        })
      );
      setAvailableTickets(tickets);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, availableTickets, loading, error, refetch: fetchEvents };
};