import api from '../axiosConfig';

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  getProfile: () => 
    api.get('/users/me'),
};