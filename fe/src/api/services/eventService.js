import api from '../axiosConfig';

export const eventService = {
  getAll: () => 
    api.get('/events'),
  
  getById: (id) => 
    api.get(`/events/${id}`),
  
  create: (data) => 
    api.post('/events', data),
  
  update: (id, data) => 
    api.patch(`/events/${id}`, data),
  
  delete: (id) => 
    api.delete(`/events/${id}`),
  
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/events/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getAvailableTickets: (id) => 
    api.get(`/events/${id}/available-tickets`),
};