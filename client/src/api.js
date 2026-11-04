import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((response) => response.data);

export const fetchListings = (params, signal) =>
  api.get('/listings', { params, signal }).then((response) => response.data);

export const addListing = (listing) =>
  api.post('/listings', listing).then((response) => response.data);

export const updateListing = (id, listing) =>
  api.put(`/listings/${id}`, listing).then((response) => response.data);

export const deleteListing = (id) => api.delete(`/listings/${id}`);

export const isCancel = axios.isCancel;

export function errorMessage(error) {
  if (!error.response) return 'сервер недоступен';

  const { error: message, details } = error.response.data ?? {};
  if (!message) return `ошибка ${error.response.status}`;

  return details?.length ? `${message}: ${details.join('; ')}` : message;
}
