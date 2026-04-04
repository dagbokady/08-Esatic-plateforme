import api from './api';

export const getClasses = () => api.get('/classes/');
export const getMaClasse = () => api.get('/classes/ma-classe');
export const rejoindre = (token) => api.post(`/classes/rejoindre/${token}`);
export const creerInvitation = (classId) =>
  api.post(`/classes/${classId}/invitations`);
export const devenirDelegue = () => api.post('/auth/devenir-delegue');

export const getDemandesClasse = (classId) =>
  api.get(`/classes/${classId}/demandes`);
export const approuverEtudiant = (classId, userId) =>
  api.post(`/classes/${classId}/approuver/${userId}`);
export const refuserEtudiant = (classId, userId) =>
  api.post(`/classes/${classId}/refuser/${userId}`);