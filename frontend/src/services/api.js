import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const get = async (u, params) => (await api.get(u, { params })).data.data;
export const send = async (m, u, body) => (await api[m](u, body)).data.data;
export const errMsg = e => e.response?.data?.message || e.message;
export default api;
