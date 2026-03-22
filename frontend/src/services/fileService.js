import api from './api';

export const getFichiersClasse = (classId) => api.get(`/files/classe/${classId}`);
export const uploaderFichier   = (data)    => api.post('/files/upload', null, { params: data });
export const voter             = (fileId)  => api.post(`/files/${fileId}/vote`);
export const supprimerFichier  = (fileId)  => api.delete(`/files/${fileId}`);