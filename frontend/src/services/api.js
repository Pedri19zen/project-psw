import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});
// Interceptor: Adiciona o token automaticamente a TODOS os pedidos
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Funções de Veículos ---

export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};


// --- Funções de Oficinas e Serviços ---

export const getWorkshops = async () => {
  const response = await api.get('/workshops');
  return response.data;
};

export const getWorkshopDetails = async (id) => {
  const response = await api.get(`/workshops/${id}`);
  return response.data;
};


// --- Funções de Marcações (Bookings) ---

// GET: Buscar as minhas marcações
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

// PUT: Cancelar uma marcação
export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/cancel/${id}`);
  return response.data;
};

export default api;