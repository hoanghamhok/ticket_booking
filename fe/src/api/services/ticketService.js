import api from '../axiosConfig';

export const ticketService = {
  create: (eventId, price, quantity) => 
    api.post('/tickets/create', { eventId, price, quantity }),
};