import axios from 'axios';

// Esta é a morada do servidor que o teu colega (Membro 1) vai ligar
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Isto serve para enviar o "token" de login automaticamente em cada pedido
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;