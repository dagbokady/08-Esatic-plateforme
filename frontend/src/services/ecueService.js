import api from './api';

export const getEcuesClasse = (classId) =>
  api.get(`/ecues/classe/${classId}`);

export const creerEcue = (name, classId) =>
  api.post('/ecues/', null, { params: { name, class_id: classId } });

export const supprimerEcue = (ecueId) =>
  api.delete(`/ecues/${ecueId}`);