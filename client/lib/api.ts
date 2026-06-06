import axios from 'axios';

// חיבור ישיר לפורט של שרת ה-Spring Boot שלך
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 האינטרספטור: מזריק אוטומטית את ה-JWT מהדפדפן לכל בקשה שיוצאת לשרת
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;