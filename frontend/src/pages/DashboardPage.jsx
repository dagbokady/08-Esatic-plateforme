// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaClasse } from '../services/classService';
import { getFichiersClasse, voter, supprimerFichier } from '../services/fileService';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [classe,   setClasse]   = useState(null);
  const [fichiers, setFichiers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtre,   setFiltre]   = useState('tous');

  const chargerDonnees = () => {
    getMaClasse()
      .then((res) => {
        setClasse(res.data);
        return getFichiersClasse(res.data.id);
      })
      .then((res) => setFichiers(res.data))
      .catch((err) => console.error(err))
      .finally(()  => setLoading(false));
  };

  useEffect(() => { chargerDonnees(); }, []);

  const handleVote = async (fileId) => {
    try {
      await voter(fileId);
      chargerDonnees();  // recharge pour voir le nouveau statut
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du vote');
    }
  };

  const handleSupprimer = async (fileId) => {
    if (!confirm('Supprimer ce fichier ?')) return;
    try {
      await supprimerFichier(fileId);
      chargerDonnees();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/login');
  };

  const fichiersFiltres = fichiers.filter((f) => {
    if (filtre === 'tous')     return true;
    if (filtre === 'approuve') return f.status === 'approved';
    if (filtre === 'attente')  return f.status === 'pending';
    if (filtre === 'miens')    return f.uploader_id === user?.id;
    return true;
  });

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <span style={styles.navLogo}>EsaticShare</span>
        <div style={styles.navRight}>
          {classe && (
            <span style={styles.badge}>
              {classe.niveau} · {classe.filiere}
            </span>
          )}
          <span style={styles.userName}>{user?.full_name}</span>
          <button
            style={styles.btnUpload}
            onClick={() => navigate('/upload')}
          >
            + Envoyer un fichier
          </button>
          <button style={styles.btnLogout} onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={styles.contenu}>

        {/* HEADER CLASSE */}
        {classe && (
          <div style={styles.classeHeader}>
            <div>
              <h2 style={styles.classeNom}>{classe.niveau} — {classe.filiere}</h2>
              <p style={styles.classeMeta}>{classe.nb_membres} membres actifs</p>
            </div>
            <div style={styles.classeStats}>
              <div style={styles.stat}>
                <span style={styles.statVal}>{fichiers.length}</span>
                <span style={styles.statLbl}>Fichiers</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statVal}>
                  {fichiers.filter(f => f.status === 'approved').length}
                </span>
                <span style={styles.statLbl}>Validés</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statVal}>
                  {fichiers.filter(f => f.status === 'pending').length}
                </span>
                <span style={styles.statLbl}>En attente</span>
              </div>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div style={styles.filtres}>
          {[
            { key: 'tous',     label: 'Tous' },
            { key: 'approuve', label: 'Validés' },
            { key: 'attente',  label: 'En attente' },
            { key: 'miens',    label: 'Mes fichiers' },
          ].map((f) => (
            <button
              key={f.key}
              style={{
                ...styles.filtre,
                background: filtre === f.key ? '#2563EB' : '#fff',
                color:      filtre === f.key ? '#fff'    : '#475569',
                border:     filtre === f.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
              }}
              onClick={() => setFiltre(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* GRILLE FICHIERS */}
        {fichiersFiltres.length === 0 ? (
          <p style={styles.vide}>Aucun fichier dans cette catégorie.</p>
        ) : (
          <div style={styles.grid}>
            {fichiersFiltres.map((f) => {
              const estMien      = f.uploader_id === user?.id;
              const peutVoter    = !estMien && f.status === 'pending';
              const pourcentVote = f.votes.total > 0
                ? Math.round((f.votes.count / f.votes.total) * 100)
                : 0;

              return (
                <div key={f.id} style={styles.card}>

                  {/* HAUT DE LA CARTE */}
                  <div style={styles.cardTop}>
                    <span style={styles.fileIcon}>
                      {f.file_type === 'cours'   ? '📘' :
                        f.file_type === 'sujet'   ? '📄' :
                          f.file_type === 'corrige' ? '✅' : '📁'}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      background: f.status === 'approved' ? '#DCFCE7' : '#FEF9C3',
                      color:      f.status === 'approved' ? '#166534' : '#854D0E',
                    }}>
                      {f.status === 'approved' ? 'Validé' : 'En attente'}
                    </span>
                  </div>

                  {/* INFOS */}
                  <p style={styles.cardTitre}>{f.title}</p>
                  <p style={styles.cardType}>
                    {f.file_type === 'cours'   ? 'Cours' :
                      f.file_type === 'sujet'   ? "Sujet d'examen" :
                        f.file_type === 'corrige' ? 'Corrigé' : 'TD / TP'}
                  </p>

                  {/* BARRE DE VOTE */}
                  {f.status === 'pending' && (
                    <div style={styles.voteWrap}>
                      <div style={styles.voteBar}>
                        <div style={{
                          ...styles.voteFill,
                          width: `${Math.min(pourcentVote, 100)}%`
                        }} />
                      </div>
                      <p style={styles.voteLbl}>
                        {f.votes.count} / {f.votes.required} votes · {pourcentVote}%
                      </p>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div style={styles.actions}>
                    {peutVoter && (
                      <button
                        style={styles.btnVote}
                        onClick={() => handleVote(f.id)}
                      >
                        👍 Voter
                      </button>
                    )}
                    {estMien && (
                      <button
                        style={styles.btnSuppr}
                        onClick={() => handleSupprimer(f.id)}
                      >
                        🗑 Supprimer
                      </button>
                    )}
                    {estMien && (
                      <span style={styles.monFichier}>Mon fichier</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page        : { minHeight: '100vh', background: '#F1F5F9' },
  loading     : { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94A3B8' },
  navbar      : { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  navLogo     : { fontWeight: '700', fontSize: '16px', color: '#1442A0' },
  navRight    : { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  badge       : { background: '#DBEAFE', color: '#1442A0', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  userName    : { fontSize: '13px', color: '#475569' },
  btnUpload   : { padding: '7px 14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  btnLogout   : { padding: '6px 12px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#475569' },
  contenu     : { maxWidth: '960px', margin: '0 auto', padding: '24px' },
  classeHeader: { background: 'linear-gradient(135deg, #1442A0, #2563EB)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  classeNom   : { color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 },
  classeMeta  : { color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '4px' },
  classeStats : { display: 'flex', gap: '20px' },
  stat        : { textAlign: 'right' },
  statVal     : { display: 'block', color: '#fff', fontSize: '22px', fontWeight: '700' },
  statLbl     : { color: 'rgba(255,255,255,0.55)', fontSize: '11px' },
  filtres     : { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filtre      : { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all .15s' },
  vide        : { color: '#94A3B8', fontSize: '13px' },
  grid        : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  card        : { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop     : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fileIcon    : { fontSize: '20px' },
  statusBadge : { padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600' },
  cardTitre   : { fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: 0 },
  cardType    : { fontSize: '11px', color: '#94A3B8', margin: 0 },
  voteWrap    : { marginTop: '4px' },
  voteBar     : { height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' },
  voteFill    : { height: '100%', background: '#3B82F6', borderRadius: '2px', transition: 'width .3s' },
  voteLbl     : { fontSize: '10px', color: '#94A3B8', marginTop: '4px', margin: 0 },
  actions     : { display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' },
  btnVote     : { padding: '5px 10px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' },
  btnSuppr    : { padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' },
  monFichier  : { fontSize: '10px', color: '#94A3B8', alignSelf: 'center' },
};