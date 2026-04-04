// src/services/adminService.js
import api from './api';

export const getStats        = ()       => api.get('/admin/stats');
export const getUsers        = ()       => api.get('/admin/users');
export const getClassesAdmin = ()       => api.get('/admin/classes');
export const nommerDelegue   = (userId) => api.post(`/admin/users/${userId}/nommer-delegue`);
export const revoquerDelegue = (userId) => api.post(`/admin/users/${userId}/revoquer-delegue`);
export const desactiverUser  = (userId) => api.post(`/admin/users/${userId}/desactiver`);
export const getDemandes      = ()       => api.get('/admin/demandes');
export const approuverAdmin   = (userId) => api.post(`/admin/users/${userId}/approuver`);
export const refuserAdmin     = (userId) => api.post(`/admin/users/${userId}/refuser`);