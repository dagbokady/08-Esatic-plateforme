import api from './api';

export const getFichiersClasse = (classId) =>
  api.get(`/files/classe/${classId}`);

// Upload avec FormData — nécessaire pour envoyer un vrai fichier
export const uploaderFichier = (formData) =>
  api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const voter           = (fileId) => api.post(`/files/${fileId}/vote`);
export const supprimerFichier = (fileId) => api.delete(`/files/${fileId}`);