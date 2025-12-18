import api from '../axiosConfig';

export const bookingService = {
  getMyBookings: () => 
    api.get('/bookings/me'),
  
  holdTicket: (eventId, quantity) => 
    api.post('/bookings/hold', { eventId, quantity }),
  
  payBooking: (id) => 
    api.post(`/bookings/${id}/pay`),
};