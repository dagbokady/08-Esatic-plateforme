import api from './api';

export const getClasses   = ()          => api.get('/classes/');
export const getMaClasse  = ()          => api.get('/classes/ma-classe');
export const rejoindre    = (token)     => api.post(`/classes/rejoindre/${token}`);
export const creerInvitation = (classId) => api.post(`/classes/${classId}/invitations`);