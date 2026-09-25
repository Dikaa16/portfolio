import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({ baseURL: `${API_URL}/api` });

const TOKEN_KEY = 'adminToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// True if the JWT exists and its exp claim is still in the future
export const isTokenValid = (token = getToken()) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Message for a failed public page load
export const loadErrorMessage = (error, fallback) =>
  error.response?.status === 429
    ? 'Too many requests. Please wait a moment and refresh the page.'
    : fallback;

// Message for a failed admin action, preferring the server's explanation
export const actionErrorMessage = (error) =>
  error.response?.data?.message || error.message;
