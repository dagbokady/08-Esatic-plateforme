// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStats, getUsers, getClassesAdmin, getDemandes,
  nommerDelegue, revoquerDelegue, desactiverUser,
  approuverAdmin, refuserAdmin,
  getFichiersAdmin, supprimerFichierAdmin, approuverFichierAdmin
} from '../services/adminService';

export default function AdminPage() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [onglet,   setOnglet]   = useState('users');
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [demandes, setDemandes] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    if (!loading && user?.role !== 'admin') navigate('/dashboard');
  }, [loading, user]);

  const charger = async () => {
    try {
      const [s, u, c, d, f] = await Promise.all([
        getStats(), getUsers(), getClassesAdmin(), getDemandes(), getFichiersAdmin()
      ]);
      setStats(s.data);
      setUsers(u.data);
      setClasses(c.data);
      setDemandes(d.data);
      setFichiers(f.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleNommerDelegue = async (userId, nom) => {
    if (!confirm(`Nommer ${nom} délégué ?`)) return;
    try {
      await nommerDelegue(userId);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const handleRevoquer = async (userId, nom) => {
    if (!confirm(`Révoquer le rôle de délégué de ${nom} ?`)) return;
    try {
      await revoquerDelegue(userId);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const handleDesactiver = async (userId, nom) => {
    if (!confirm(`Désactiver le compte de ${nom} ?`)) return;
    try {
      await desactiverUser(userId);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const usersFiltres = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.matricule.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = {
    admin   : { bg: '#EDE9FE', color: '#6D28D9' },
    delegate: { bg: '#FEF3C7', color: '#D97706' },
    student : { bg: 'var(--gray-100)', color: 'var(--gray-500)' },
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <span style={{ color:'var(--gray-400)' }}>Chargement...</span>
    </div>
  );

  return (
    <div style={s.root}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>
            <div style={s.navLogoMark}>ES</div>
            <span style={s.navLogoText}>EsaticShare</span>
          </div>
          <div style={s.navDivider} />
          <span style={s.navRole}>Administration</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navUser}>{user?.full_name}</span>
          <button style={s.btnGhost} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button style={s.btnGhost} onClick={() => { deconnexion(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={s.body}>

        {/* STATS */}
        {stats && (
          <div style={s.statsGrid}>
            {[
              { val: stats.total_users,     lbl: 'Étudiants',  icon: '👥' },
              { val: stats.total_files,     lbl: 'Fichiers',   icon: '📁' },
              { val: stats.total_classes,   lbl: 'Classes',    icon: '🏫' },
              { val: stats.total_delegates, lbl: 'Délégués',   icon: '🎖️' },
            ].map((st) => (
              <div key={st.lbl} style={s.statCard}>
                <span style={s.statIcon}>{st.icon}</span>
                <div>
                  <p style={s.statVal}>{st.val}</p>
                  <p style={s.statLbl}>{st.lbl}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLETS */}
        <div style={s.onglets}>
          {[
            { key: 'users',   label: `Utilisateurs (${users.length})` },
            { key: 'classes', label: `Classes (${classes.length})` },
            { key: 'fichiers', label: `Fichiers (${fichiers.length})` },
            { key: 'demandes', label: `Demandes (${demandes.length})` },
          ].map((o) => (
            <button
              key={o.key}
              style={{
                ...s.onglet,
                borderBottom: onglet === o.key ? '2px solid var(--blue-500)' : '2px solid transparent',
                color       : onglet === o.key ? 'var(--blue-500)' : 'var(--gray-400)',
              }}
              onClick={() => setOnglet(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* CONTENU UTILISATEURS */}
        {onglet === 'users' && (
          <div style={s.section}>
            <input
              style={s.search}
              type="text"
              placeholder="Rechercher par nom ou matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={s.table}>
              <div style={s.tableHeader}>
                <span style={{ flex: 2 }}>Étudiant</span>
                <span style={{ flex: 1 }}>Matricule</span>
                <span style={{ flex: 1 }}>Classe</span>
                <span style={{ flex: 1 }}>Rôle</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Actions</span>
              </div>
              {usersFiltres.map((u) => (
                <div key={u.id} style={{
                  ...s.tableRow,
                  opacity: u.is_active ? 1 : 0.5,
                }}>
                  <span style={{ flex: 2, fontWeight: '500', color: 'var(--gray-800)' }}>
                    {u.full_name}
                  </span>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                    {u.matricule}
                  </span>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-500)' }}>
                    {u.classe || '—'}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{
                      ...s.roleBadge,
                      background: roleColor[u.role]?.bg,
                      color     : roleColor[u.role]?.color,
                    }}>
                      {u.role}
                    </span>
                  </span>
                  <div style={{ flex: 1, display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {u.role === 'student' && u.is_active && (
                      <button
                        style={s.btnAction}
                        onClick={() => handleNommerDelegue(u.id, u.full_name)}
                      >
                        🎖️ Délégué
                      </button>
                    )}
                    {u.role === 'delegate' && (
                      <button
                        style={{ ...s.btnAction, background: 'var(--amber-50)', color: 'var(--amber-600)', border: '1px solid #FDE68A' }}
                        onClick={() => handleRevoquer(u.id, u.full_name)}
                      >
                        Révoquer
                      </button>
                    )}
                    {u.role !== 'admin' && u.is_active && (
                      <button
                        style={{ ...s.btnAction, background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3' }}
                        onClick={() => handleDesactiver(u.id, u.full_name)}
                      >
                        Désactiver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENU CLASSES */}
        {onglet === 'classes' && (
          <div style={s.section}>
            <div style={s.classesGrid}>
              {classes.map((c) => (
                <div key={c.id} style={s.classeCard}>
                  <div style={s.classeCardTop}>
                    <div>
                      <p style={s.classeNiveau}>{c.niveau}</p>
                      <p style={s.classeFiliere}>{c.filiere}</p>
                    </div>
                    <span style={s.classeMembres}>{c.membres} membres</span>
                  </div>
                  <div style={s.classeStats}>
                    <div style={s.classeStat}>
                      <span style={s.classeStatVal}>{c.fichiers}</span>
                      <span style={s.classeStatLbl}>fichiers</span>
                    </div>
                    <div style={s.classeStat}>
                      <span style={{ ...s.classeStatVal, fontSize: '13px', color: c.delegue ? 'var(--green-600)' : 'var(--gray-300)' }}>
                        {c.delegue || 'Aucun délégué'}
                      </span>
                      <span style={s.classeStatLbl}>délégué</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {onglet === 'demandes' && (
          <div style={s.section}>
            {demandes.length === 0 ? (
              <div style={s.empty}>
                <span style={{ fontSize: '32px' }}>✅</span>
                <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>
                  Aucune demande en attente
                </p>
              </div>
            ) : (
              <div style={s.table}>
                <div style={s.tableHeader}>
                  <span style={{ flex: 2 }}>Étudiant</span>
                  <span style={{ flex: 1 }}>Matricule</span>
                  <span style={{ flex: 1 }}>Classe</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Actions</span>
                </div>
                {demandes.map((d) => (
                  <div key={d.id} style={s.tableRow}>
            <span style={{ flex: 2, fontWeight: '500', color: 'var(--gray-800)' }}>
              {d.full_name}
            </span>
                    <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
              {d.matricule}
            </span>
                    <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-500)' }}>
              {d.classe || '—'}
            </span>
                    <div style={{ flex: 1, display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        style={{ ...s.btnAction, background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0' }}
                        onClick={async () => {
                          await approuverAdmin(d.id);
                          charger();
                        }}
                      >
                        ✓ Approuver
                      </button>
                      <button
                        style={{ ...s.btnAction, background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3' }}
                        onClick={async () => {
                          if (!confirm(`Refuser ${d.full_name} ?`)) return;
                          await refuserAdmin(d.id);
                          charger();
                        }}
                      >
                        ✕ Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {onglet === 'fichiers' && (
          <div style={s.section}>
            <div style={s.table}>
              <div style={s.tableHeader}>
                <span style={{ flex: 2 }}>Titre</span>
                <span style={{ flex: 1 }}>Classe</span>
                <span style={{ flex: 1 }}>Uploadé par</span>
                <span style={{ flex: 1 }}>Statut</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Actions</span>
              </div>
              {fichiers.map((f) => (
                <div key={f.id} style={s.tableRow}>
                  <div style={{ flex: 2 }}>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--gray-800)', fontSize: '13px' }}>
                      {f.title}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--gray-400)' }}>
                      {f.file_type}
                    </p>
                  </div>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-500)' }}>
            {f.classe || '—'}
          </span>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--gray-500)' }}>
            {f.uploader || '—'}
          </span>
                  <span style={{ flex: 1 }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              background: f.status === 'approved' ? '#DCFCE7' : '#FEF9C3',
              color     : f.status === 'approved' ? '#166534' : '#854D0E',
            }}>
              {f.status === 'approved' ? 'Validé' : 'En attente'}
            </span>
          </span>
                  <div style={{ flex: 1, display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {f.status === 'pending' && (
                      <button
                        style={{ ...s.btnAction, background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0' }}
                        onClick={async () => {
                          await approuverFichierAdmin(f.id);
                          charger();
                        }}
                      >
                        ✓ Valider
                      </button>
                    )}
                    {f.storage_url && (
                      <a
                      href={f.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...s.btnAction, textDecoration: 'none' }}
                      >
                      ⬇
                      </a>
                      )}
                    <button
                      style={{ ...s.btnAction, background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3' }}
                      onClick={async () => {
                        if (!confirm(`Supprimer "${f.title}" ?`)) return;
                        await supprimerFichierAdmin(f.id);
                        charger();
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                ))}
            </div>
          </div>
          )}

      </div>
    </div>
  );
}

const s = {
  root        : { minHeight: '100vh', background: 'var(--gray-50)' },
  nav         : { background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' },
  navLeft     : { display: 'flex', alignItems: 'center', gap: '16px' },
  navLogo     : { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogoMark : { width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '12px', color: '#fff' },
  navLogoText : { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--navy-900)' },
  navDivider  : { width: '1px', height: '20px', background: 'var(--gray-200)' },
  navRole     : { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: '#7C3AED' },
  navRight    : { display: 'flex', alignItems: 'center', gap: '10px' },
  navUser     : { fontSize: '13px', color: 'var(--gray-500)', fontFamily: 'var(--font-display)' },
  btnGhost    : { padding: '7px 12px', background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '12px', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'var(--font-display)' },

  body        : { maxWidth: '1100px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },

  statsGrid   : { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  statCard    : { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--gray-200)' },
  statIcon    : { fontSize: '28px' },
  statVal     : { fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 },
  statLbl     : { fontSize: '12px', color: 'var(--gray-400)', margin: 0 },

  onglets     : { display: 'flex', gap: '0', borderBottom: '1px solid var(--gray-200)' },
  onglet      : { padding: '10px 20px', background: 'none', border: 'none', fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' },

  section     : { display: 'flex', flexDirection: 'column', gap: '14px' },
  search      : { padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--white)', width: '320px', fontFamily: 'var(--font-body)' },

  table       : { background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  tableHeader : { display: 'flex', padding: '12px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tableRow    : { display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', fontSize: '13px', fontFamily: 'var(--font-body)', transition: 'background 0.1s' },
  roleBadge   : { padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600' },
  btnAction   : { padding: '4px 10px', background: 'var(--blue-50)', color: 'var(--blue-500)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer' },

  classesGrid : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' },
  classeCard  : { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '18px', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' },
  classeCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  classeNiveau: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', color: 'var(--navy-900)', margin: 0 },
  classeFiliere: { fontSize: '12px', color: 'var(--blue-500)', fontFamily: 'var(--font-display)', fontWeight: '600', margin: '2px 0 0' },
  classeMembres: { fontSize: '11px', color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: '10px' },
  classeStats : { display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' },
  classeStat  : { display: 'flex', flexDirection: 'column', gap: '2px' },
  classeStatVal: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--navy-900)' },
  classeStatLbl: { fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' },
};