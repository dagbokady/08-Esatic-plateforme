// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaClasse } from '../services/classService';
import { getFichiersClasse, voter, supprimerFichier } from '../services/fileService';
import { useNavigate } from 'react-router-dom';

const FILE_TYPE_LABELS = {
  cours  : { label: 'Cours',           icon: '📘', color: '#EFF6FF', text: '#1D4ED8' },
  sujet  : { label: "Sujet d'examen",  icon: '📄', color: '#FFF7ED', text: '#C2410C' },
  corrige: { label: 'Corrigé',         icon: '✅', color: '#F0FDF4', text: '#15803D' },
  td_tp  : { label: 'TD / TP',         icon: '📁', color: '#FAF5FF', text: '#7C3AED' },
};

export default function DashboardPage() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [classe,   setClasse]   = useState(null);
  const [fichiers, setFichiers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtre,   setFiltre]   = useState('tous');
  const [votingId, setVotingId] = useState(null);

  const charger = () => {
    getMaClasse()
      .then((res) => {
        setClasse(res.data);
        return getFichiersClasse(res.data.id);
      })
      .then((res) => setFichiers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const handleVote = async (fileId) => {
    setVotingId(fileId);
    try {
      await voter(fileId);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du vote');
    } finally {
      setVotingId(null);
    }
  };

  const handleSupprimer = async (fileId) => {
    if (!confirm('Supprimer ce fichier définitivement ?')) return;
    try {
      await supprimerFichier(fileId);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const filtres = [
    { key: 'tous',     label: 'Tous',        count: fichiers.length },
    { key: 'approuve', label: 'Validés',      count: fichiers.filter(f => f.status === 'approved').length },
    { key: 'attente',  label: 'En attente',   count: fichiers.filter(f => f.status === 'pending').length },
    { key: 'miens',    label: 'Mes fichiers', count: fichiers.filter(f => f.uploader_id === user?.id).length },
  ];

  const fichiersFiltres = fichiers.filter((f) => {
    if (filtre === 'approuve') return f.status === 'approved';
    if (filtre === 'attente')  return f.status === 'pending';
    if (filtre === 'miens')    return f.uploader_id === user?.id;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '10px' }}>
      <div style={s.spinner} />
      <span style={{ color: 'var(--gray-400)', fontSize: '14px' }}>Chargement...</span>
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
          {classe && (
            <>
              <div style={s.navDivider} />
              <div style={s.navClass}>
                <span style={s.navClassBadge}>
                  {classe.niveau} · {classe.filiere}
                </span>
              </div>
            </>
          )}
        </div>
        <div style={s.navRight}>
          <div style={s.navUser}>


          </div>
          <button style={s.btnPrimary} onClick={() => navigate('/upload')}>
            + Envoyer
          </button>
          {user?.role === 'delegate' && (
            <button
              style={s.btnDelegate}
              onClick={() => navigate('/delegue')}
            >
              🎖️ Espace délégué
            </button>
          )}
          <button style={s.btnGhost} onClick={() => { deconnexion(); navigate('/login'); }}>
            Déconnexion
          </button>
          <span style={s.navUserName}>{user?.full_name}</span>
          <div style={s.avatar}>
            {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
          </div>

        </div>
      </nav>

      <div style={s.body}>
        {/* HERO CLASSE */}
        {classe && (
          <div style={s.hero}>
            <div style={s.heroGlow} />
            <div style={s.heroContent}>
              <div>
                <p style={s.heroEyebrow}>Ma classe</p>
                <h1 style={s.heroTitle}>{classe.niveau} — {classe.filiere}</h1>
                <p style={s.heroMeta}>{classe.nb_membres} membres actifs</p>
              </div>
              <div style={s.heroStats}>
                {[
                  { val: fichiers.length, lbl: 'Fichiers' },
                  { val: fichiers.filter(f => f.status === 'approved').length, lbl: 'Validés' },
                  { val: fichiers.filter(f => f.status === 'pending').length, lbl: 'En attente' },
                ].map((st) => (
                  <div key={st.lbl} style={s.heroStat}>
                    <span style={s.heroStatVal}>{st.val}</span>
                    <span style={s.heroStatLbl}>{st.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div style={s.filtresBar}>
          <div style={s.filtres}>
            {filtres.map((f) => (
              <button
                key={f.key}
                style={{
                  ...s.filtre,
                  background: filtre === f.key ? 'var(--navy-800)' : 'var(--white)',
                  color     : filtre === f.key ? '#fff' : 'var(--gray-500)',
                  boxShadow : filtre === f.key ? '0 2px 8px rgba(10,22,40,0.2)' : 'var(--shadow-sm)',
                }}
                onClick={() => setFiltre(f.key)}
              >
                {f.label}
                <span style={{
                  ...s.filtreBadge,
                  background: filtre === f.key ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
                  color     : filtre === f.key ? '#fff' : 'var(--gray-400)',
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE */}
        {fichiersFiltres.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>📂</span>
            <p style={s.emptyText}>Aucun fichier dans cette catégorie</p>
            <button style={s.emptyBtn} onClick={() => navigate('/upload')}>
              Envoyer le premier fichier
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {fichiersFiltres.map((f, i) => {
              const type         = FILE_TYPE_LABELS[f.file_type] || FILE_TYPE_LABELS.cours;
              const estMien      = f.uploader_id === user?.id;
              const peutVoter    = !estMien && f.status === 'pending';
              const pct          = f.votes.total > 0 ? Math.round((f.votes.count / f.votes.total) * 100) : 0;
              const isVoting     = votingId === f.id;

              return (
                <div
                  key={f.id}
                  style={{
                    ...s.card,
                    animationDelay: `${i * 0.05}s`,
                    animation: 'fadeUp 0.4s ease both',
                  }}
                >
                  {/* TYPE BADGE */}
                  <div style={s.cardTop}>
                    <div style={{
                      ...s.typeBadge,
                      background: type.color,
                      color     : type.text,
                    }}>
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                    <div style={{
                      ...s.statusDot,
                      background: f.status === 'approved' ? 'var(--green-600)' : 'var(--amber-600)',
                    }} />
                  </div>

                  {/* TITRE */}
                  <h3 style={s.cardTitle}>{f.title}</h3>

                  {/* STATUS */}
                  {f.status === 'approved' ? (
                    <span style={s.approvedTag}>✓ Validé</span>
                  ) : (
                    <div style={s.voteSection}>
                      <div style={s.voteHeader}>
                        <span style={s.votePct}>{pct}%</span>
                        <span style={s.voteCount}>{f.votes.count}/{f.votes.required} votes</span>
                      </div>
                      <div style={s.voteTrack}>
                        <div style={{
                          ...s.voteFill,
                          width: `${Math.min(pct, 100)}%`,
                          background: pct >= 70
                            ? 'linear-gradient(90deg, var(--green-600), #22C55E)'
                            : 'linear-gradient(90deg, var(--blue-500), var(--blue-300))',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div style={s.cardActions}>
                    {peutVoter && (
                      <button
                        style={{ ...s.btnVote, opacity: isVoting ? 0.7 : 1 }}
                        onClick={() => handleVote(f.id)}
                        disabled={isVoting}
                      >
                        {isVoting ? '...' : '👍 Voter'}
                      </button>
                    )}

                    {estMien && (
                      <button style={s.btnDel} onClick={() => handleSupprimer(f.id)}>
                        🗑
                      </button>
                    )}
                    {estMien && (
                      <span style={s.ownerTag}>Mon fichier</span>
                    )}
                    {/* Dans la section cardActions, ajoute : */}
                    {f.status === 'approved' && f.storage_url && (
                    <a  href={f.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={s.btnDownload}
                      >
                      ⬇ Télécharger
                      </a>
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

const s = {
  root      : { minHeight: '100vh', background: 'var(--gray-50)' },
  spinner   : { width: '20px', height: '20px', border: '2px solid var(--gray-200)', borderTop: '2px solid var(--blue-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  /* NAV */
  nav       : { background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' },
  navLeft   : { display: 'flex', alignItems: 'center', gap: '16px' },
  navLogo   : { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogoMark: { width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '12px', color: '#fff' },
  navLogoText: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--navy-900)' },
  navDivider: { width: '1px', height: '20px', background: 'var(--gray-200)' },
  navClass  : { display: 'flex', alignItems: 'center' },
  navClassBadge: { padding: '4px 10px', background: 'var(--blue-50)', color: 'var(--blue-500)', borderRadius: '20px', fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600' },
  navRight  : { display: 'flex', alignItems: 'center', gap: '10px' },
  navUser   : { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar    : { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '11px', color: '#fff' },
  navUserName: { fontSize: '13px', color: 'var(--gray-600)', fontFamily: 'var(--font-display)', fontWeight: '500' },
  btnPrimary: { padding: '7px 16px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' },
  btnGhost  : { padding: '7px 12px', background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '12px', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'var(--font-display)' },
  btnDelegate : { padding: '7px 14px', background: 'var(--amber-50)', color: 'var(--amber-600)', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  btnDownload : { padding: '5px 10px', background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  /* BODY */
  body      : { maxWidth: '1000px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },

  /* HERO */
  hero      : { background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden' },
  heroGlow  : { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', pointerEvents: 'none' },
  heroContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  heroEyebrow: { fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' },
  heroTitle : { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  heroMeta  : { fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 },
  heroStats : { display: 'flex', gap: '32px' },
  heroStat  : { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
  heroStatVal: { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', color: '#fff', lineHeight: 1 },
  heroStatLbl: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' },

  /* FILTRES */
  filtresBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  filtres   : { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filtre    : { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' },
  filtreBadge: { padding: '1px 7px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },

  /* EMPTY */
  empty     : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '64px 0', color: 'var(--gray-400)' },
  emptyIcon : { fontSize: '40px' },
  emptyText : { fontSize: '14px', color: 'var(--gray-400)' },
  emptyBtn  : { padding: '8px 20px', background: 'var(--blue-50)', color: 'var(--blue-500)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer' },

  /* GRID */
  grid      : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' },
  card      : { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default' },
  cardTop   : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge : { display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600' },
  statusDot : { width: '8px', height: '8px', borderRadius: '50%' },
  cardTitle : { fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)', fontFamily: 'var(--font-display)', lineHeight: 1.4 },
  approvedTag: { fontSize: '12px', color: 'var(--green-600)', fontFamily: 'var(--font-display)', fontWeight: '600' },

  /* VOTE */
  voteSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  voteHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  votePct   : { fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--blue-500)' },
  voteCount : { fontSize: '11px', color: 'var(--gray-400)' },
  voteTrack : { height: '5px', background: 'var(--gray-100)', borderRadius: '3px', overflow: 'hidden' },
  voteFill  : { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' },

  /* CARD ACTIONS */
  cardActions: { display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' },
  btnVote   : { padding: '5px 10px', background: 'var(--blue-50)', color: 'var(--blue-500)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer' },
  btnDel    : { padding: '5px 8px', background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' },
  ownerTag  : { fontSize: '10px', color: 'var(--gray-300)', fontStyle: 'italic', marginLeft: 'auto' },
};