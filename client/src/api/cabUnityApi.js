import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // שנה/י בהתאם לפורט של ה-Spring Boot

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const passengerApi = {
  register: (userData) => api.post('/passenger/register', userData),
  updateProfile: (id, details) => api.put(`/passenger/${id}/update`, details),
  createRide: (passengerId, rideData) => api.post(`/passenger/${passengerId}/rides`, rideData),
  matchToGroup: (rideId) => api.post(`/passenger/rides/${rideId}/match`),
  getHistory: (passengerId) => api.get(`/passenger/${passengerId}/history`),
  cancelRide: (rideId) => api.put(`/passenger/rides/${rideId}/cancel`),
  getRideDetails: (rideId) => api.get(`/passenger/rides/${rideId}`),
};

export const driverApi = {
  updateLocation: (driverId, lat, lng) => 
    api.post(`/driver/${driverId}/location?lat=${lat}&lng=${lng}`),
  startShift: (driverId) => api.post(`/driver/${driverId}/start-shift`),
  changeAvailability: (driverId, isAvailable) => 
    api.put(`/driver/${driverId}/availability?isAvailable=${isAvailable}`),
  updateRideStatus: (rideId, status) => 
    api.put(`/driver/rides/${rideId}/status?status=${status}`),
};

export const adminApi = {
  getAllDrivers: () => api.get('/admin/drivers'),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  approveDriver: (driverId, isApproved) => 
    api.put(`/admin/drivers/${driverId}/approve?isApproved=${isApproved}`),
};