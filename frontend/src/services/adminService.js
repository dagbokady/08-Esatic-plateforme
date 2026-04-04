// src/services/adminService.js
import api from './api';

export const getStats         = ()       => api.get('/admin/stats');
export const getUsers         = ()       => api.get('/admin/users');
export const getClassesAdmin  = ()       => api.get('/admin/classes');
export const getDemandes      = ()       => api.get('/admin/demandes');
export const nommerDelegue    = (userId) => api.post(`/admin/users/${userId}/nommer-delegue`);
export const revoquerDelegue  = (userId) => api.post(`/admin/users/${userId}/revoquer-delegue`);
export const desactiverUser   = (userId) => api.post(`/admin/users/${userId}/desactiver`);
export const approuverAdmin   = (userId) => api.post(`/admin/users/${userId}/approuver`);
export const refuserAdmin     = (userId) => api.post(`/admin/users/${userId}/refuser`);
export const getFichiersAdmin = ()       => api.get('/admin/fichiers');
export const supprimerFichierAdmin = (fileId) => api.delete(`/admin/fichiers/${fileId}`);
export const approuverFichierAdmin = (fileId) => api.post(`/admin/fichiers/${fileId}/approuver`);