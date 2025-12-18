import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { eventService } from '../api/services/eventService';
import { ticketService } from '../api/services/ticketService';

const AdminPage = () => {
  const { events, refetch } = useEvents();
  const [loading, setLoading] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', startAt: '', endAt: ''
  });
  const [eventImage, setEventImage] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    eventId: '', price: '', quantity: ''
  });

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const { data } = await eventService.create(newEvent);
      if (eventImage) {
        await eventService.uploadImage(data.id, eventImage);
      }
      alert('Event created!');
      setNewEvent({ title: '', description: '', startAt: '', endAt: '' });
      setEventImage(null);
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTickets = async () => {
    setLoading(true);
    try {
      await ticketService.create(
        ticketForm.eventId,
        parseInt(ticketForm.price),
        parseInt(ticketForm.quantity)
      );
      alert('Tickets created!');
      setTicketForm({ eventId: '', price: '', quantity: '' });
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
        deleteUser(id);
      }
    setLoading(true);
    try {
      await eventService.delete(id);
      alert('Deleted!');
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Event Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Create Event</h2>
        {/* Form fields... */}
      </div>

      {/* Create Tickets */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Create Tickets</h2>
        {/* Form fields... */}
      </div>

      {/* Manage Events */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Manage Events</h2>
        {events.map((event) => (
          <div key={event.id} className="flex justify-between items-center border p-4 mb-2">
            <div>
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
            <button
              onClick={() => handleDelete(event.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;