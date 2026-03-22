import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaClasse } from '../services/classService';
import { getFichiersClasse } from '../services/fileService';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [classe,   setClasse]   = useState(null);
  const [fichiers, setFichiers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMaClasse()
      .then((res) => {
        setClasse(res.data);
        return getFichiersClasse(res.data.id);
      })
      .then((res) => setFichiers(res.data))
      .catch((err) => console.error(err))
      .finally(()  => setLoading(false));
  }, []);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/login');
  };

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
          <button style={styles.btnLogout} onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU */}
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
                  {fichiers.filter(f => f.status === 'pending').length}
                </span>
                <span style={styles.statLbl}>En attente</span>
              </div>
            </div>
          </div>
        )}

        {/* LISTE FICHIERS */}
        <h3 style={styles.sectionTitre}>Fichiers de la classe</h3>

        {fichiers.length === 0 ? (
          <p style={styles.vide}>Aucun fichier pour l'instant.</p>
        ) : (
          <div style={styles.grid}>
            {fichiers.map((f) => (
              <div key={f.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.fileIcon}>📄</span>
                  <span style={{
                    ...styles.statusBadge,
                    background: f.status === 'approved' ? '#DCFCE7' : '#FEF9C3',
                    color:      f.status === 'approved' ? '#166534' : '#854D0E',
                  }}>
                    {f.status === 'approved' ? 'Validé' : 'En attente'}
                  </span>
                </div>
                <p style={styles.cardTitre}>{f.title}</p>
                <p style={styles.cardType}>{f.file_type}</p>

                {f.status === 'pending' && (
                  <div style={styles.voteWrap}>
                    <div style={styles.voteBar}>
                      <div style={{
                        ...styles.voteFill,
                        width: `${Math.min((f.votes.count / f.votes.total) * 100, 100)}%`
                      }} />
                    </div>
                    <p style={styles.voteLbl}>
                      {f.votes.count} / {f.votes.required} votes requis
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page        : { minHeight: '100vh', background: '#F1F5F9' },
  loading     : { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94A3B8' },
  navbar      : { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo     : { fontWeight: '700', fontSize: '16px', color: '#1442A0' },
  navRight    : { display: 'flex', alignItems: 'center', gap: '12px' },
  badge       : { background: '#DBEAFE', color: '#1442A0', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  userName    : { fontSize: '13px', color: '#475569' },
  btnLogout   : { padding: '6px 12px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#475569' },
  contenu     : { maxWidth: '900px', margin: '0 auto', padding: '24px' },
  classeHeader: { background: 'linear-gradient(135deg, #1442A0, #2563EB)', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  classeNom   : { color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 },
  classeMeta  : { color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '4px' },
  classeStats : { display: 'flex', gap: '24px' },
  stat        : { textAlign: 'right' },
  statVal     : { display: 'block', color: '#fff', fontSize: '22px', fontWeight: '700' },
  statLbl     : { color: 'rgba(255,255,255,0.55)', fontSize: '11px' },
  sectionTitre: { fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' },
  vide        : { color: '#94A3B8', fontSize: '13px' },
  grid        : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  card        : { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' },
  cardTop     : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  fileIcon    : { fontSize: '20px' },
  statusBadge : { padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600' },
  cardTitre   : { fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: '0 0 4px' },
  cardType    : { fontSize: '11px', color: '#94A3B8', margin: 0 },
  voteWrap    : { marginTop: '10px' },
  voteBar     : { height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' },
  voteFill    : { height: '100%', background: '#3B82F6', borderRadius: '2px', transition: 'width .3s' },
  voteLbl     : { fontSize: '10px', color: '#94A3B8', marginTop: '4px' },
};