import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEcuesClasse, creerEcue, supprimerEcue } from '../services/ecueService';
import {
  getMaClasse, creerInvitation,
  getDemandesClasse, approuverEtudiant, refuserEtudiant
} from '../services/classService';

export default function DelegatePage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [classe,        setClasse]        = useState(null);
  const [ecues,         setEcues]         = useState([]);
  const [invitation,    setInvitation]    = useState(null);
  const [nouvelEcue,    setNouvelEcue]    = useState('');
  const [loading,       setLoading]       = useState(true);
  const [loadingInvit,  setLoadingInvit]  = useState(false);
  const [loadingEcue,   setLoadingEcue]   = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [erreurEcue,    setErreurEcue]    = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [demandes,     setDemandes]     = useState([]);

// Dans charger()
  const charger = async () => {
    try {
      const res = await getMaClasse();
      setClasse(res.data);
      const [ecuesRes, demandesRes] = await Promise.all([
        getEcuesClasse(res.data.id),
        getDemandesClasse(res.data.id),
      ]);
      setEcues(ecuesRes.data);
      setDemandes(demandesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprouver = async (userId, nom) => {
    try {
      await approuverEtudiant(classe.id, userId);
      setDemandes(demandes.filter(d => d.id !== userId));
      alert(`${nom} a été approuvé !`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const handleRefuser = async (userId, nom) => {
    if (!confirm(`Refuser l'inscription de ${nom} ?`)) return;
    try {
      await refuserEtudiant(classe.id, userId);
      setDemandes(demandes.filter(d => d.id !== userId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };


  useEffect(() => { charger(); }, []);

  // Vérifier que l'utilisateur est bien délégué
  useEffect(() => {
    if (!loading && user?.role !== 'delegate') {
      navigate('/dashboard');
    }
  }, [loading, user]);

  const handleGenererInvitation = async () => {
    setLoadingInvit(true);
    try {
      const res = await creerInvitation(classe.id);
      setInvitation(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    } finally {
      setLoadingInvit(false);
    }
  };

  const handleCopier = () => {
    const url = `${window.location.origin}/rejoindre/${invitation.token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAjouterEcue = async (e) => {
    e.preventDefault();
    if (!nouvelEcue.trim()) return;
    setErreurEcue('');
    setLoadingEcue(true);
    try {
      await creerEcue(nouvelEcue.trim(), classe.id);
      setNouvelEcue('');
      const res = await getEcuesClasse(classe.id);
      setEcues(res.data);
    } catch (err) {
      setErreurEcue(err.response?.data?.detail || 'Erreur');
    } finally {
      setLoadingEcue(false);
    }
  };

  const handleSupprimerEcue = async (ecueId) => {
    if (!confirm('Supprimer cet ECUE ?')) return;
    try {
      await supprimerEcue(ecueId);
      setEcues(ecues.filter(e => e.id !== ecueId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <span style={{ color: 'var(--gray-400)' }}>Chargement...</span>
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
          <span style={s.navRole}>Espace délégué</span>
        </div>
        <button style={s.btnGhost} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </nav>

      <div style={s.body}>

        {/* HEADER */}
        <div style={s.header}>
          <div style={s.headerInfo}>
            <p style={s.headerEyebrow}>Délégué de classe</p>
            <h1 style={s.headerTitle}>
              {classe?.niveau} — {classe?.filiere}
            </h1>
            <p style={s.headerMeta}>{classe?.nb_membres} membres actifs</p>
          </div>
          <div style={s.delegateBadge}>
            <span style={s.delegateIcon}>🎖️</span>
            <span style={s.delegateText}>Délégué</span>
          </div>
        </div>
        {/* TUTORIEL — visible seulement si pas encore fermé */}
        {showTutorial && (
          <div style={s.tutorial}>
            <div style={s.tutorialHeader}>
              <span style={s.tutorialTitle}>👋 Guide du délégué</span>
              <button style={s.tutorialClose} onClick={() => setShowTutorial(false)}>✕</button>
            </div>
            <div style={s.tutorialSteps}>
              {[
                {
                  num : '1',
                  icon: '🔗',
                  title: 'Génère un lien d\'invitation',
                  desc : 'Va dans "Lien d\'invitation" et génère un lien unique à partager avec ta promotion.'
                },
                {
                  num : '2',
                  icon: '✅',
                  title: 'Approuve les inscriptions',
                  desc : 'Quand un étudiant s\'inscrit avec ta classe, il apparaît dans "Demandes en attente". Approuve ou refuse.'
                },
                {
                  num : '3',
                  icon: '📚',
                  title: 'Configure les ECUE',
                  desc : 'Ajoute les matières de ta classe pour que les étudiants puissent classer leurs fichiers.'
                },
                {
                  num : '4',
                  icon: '📊',
                  title: 'Suis les votes',
                  desc : 'Les fichiers soumis par d\'autres classes ont besoin de 70% de votes pour être validés.'
                },
              ].map((step) => (
                <div key={step.num} style={s.tutorialStep}>
                  <div style={s.tutorialStepIcon}>{step.icon}</div>
                  <div>
                    <p style={s.tutorialStepTitle}>{step.title}</p>
                    <p style={s.tutorialStepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEMANDES EN ATTENTE */}
        {demandes.length > 0 && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardIcon, background: '#FEF3C7' }}>🔔</div>
              <div>
                <h2 style={s.cardTitle}>
                  Demandes en attente
                  <span style={s.demandesBadge}>{demandes.length}</span>
                </h2>
                <p style={s.cardSub}>Ces étudiants attendent ton approbation</p>
              </div>
            </div>
            <div style={s.demandesList}>
              {demandes.map((d) => (
                <div key={d.id} style={s.demandeItem}>
                  <div style={s.demandeAvatar}>
                    {d.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={s.demandeInfo}>
                    <p style={s.demandeName}>{d.full_name}</p>
                    <p style={s.demandeMatricule}>{d.matricule}</p>
                  </div>
                  <div style={s.demandeActions}>
                    <button
                      style={s.btnApprouver}
                      onClick={() => handleApprouver(d.id, d.full_name)}
                    >
                      ✓ Approuver
                    </button>
                    <button
                      style={s.btnRefuser}
                      onClick={() => handleRefuser(d.id, d.full_name)}
                    >
                      ✕ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={s.grid}>

          {/* ── INVITATIONS ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIcon}>🔗</div>
              <div>
                <h2 style={s.cardTitle}>Lien d'invitation</h2>
                <p style={s.cardSub}>
                  Génère un lien pour que tes camarades rejoignent la classe
                </p>
              </div>
            </div>

            {!invitation ? (
              <div style={s.invitEmpty}>
                <p style={s.invitEmptyText}>
                  Aucun lien actif. Génère-en un pour inviter tes camarades.
                </p>
                <button
                  style={{ ...s.btnPrimary, opacity: loadingInvit ? 0.7 : 1 }}
                  onClick={handleGenererInvitation}
                  disabled={loadingInvit}
                >
                  {loadingInvit ? 'Génération...' : '+ Générer un lien d\'invitation'}
                </button>
              </div>
            ) : (
              <div style={s.invitResult}>
                <div style={s.invitBox}>
                  <span style={s.invitUrl}>
                    {window.location.origin}/rejoindre/{invitation.token}
                  </span>
                  <button
                    style={{
                      ...s.btnCopy,
                      background: copied ? 'var(--green-50)' : 'var(--blue-50)',
                      color     : copied ? 'var(--green-600)' : 'var(--blue-500)',
                    }}
                    onClick={handleCopier}
                  >
                    {copied ? '✓ Copié !' : 'Copier'}
                  </button>
                </div>
                <p style={s.invitNote}>
                  ⚠️ Générer un nouveau lien désactivera l'ancien.
                </p>
                <button
                  style={{ ...s.btnSecondary, marginTop: '4px' }}
                  onClick={handleGenererInvitation}
                  disabled={loadingInvit}
                >
                  Regénérer un lien
                </button>
              </div>
            )}
          </div>

          {/* ── ECUE ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIcon}>📚</div>
              <div>
                <h2 style={s.cardTitle}>Gestion des ECUE</h2>
                <p style={s.cardSub}>
                  Ajoute les matières de ta classe pour organiser les fichiers
                </p>
              </div>
            </div>

            {/* FORMULAIRE AJOUT */}
            <form onSubmit={handleAjouterEcue} style={s.ecueForm}>
              <input
                style={s.ecueInput}
                type="text"
                placeholder="Nom de la matière (ex : Algorithmique)"
                value={nouvelEcue}
                onChange={(e) => setNouvelEcue(e.target.value)}
              />
              <button
                style={{ ...s.btnPrimary, padding: '10px 16px', opacity: loadingEcue ? 0.7 : 1 }}
                type="submit"
                disabled={loadingEcue}
              >
                {loadingEcue ? '...' : 'Ajouter'}
              </button>
            </form>

            {erreurEcue && (
              <p style={s.erreur}>{erreurEcue}</p>
            )}

            {/* LISTE ECUE */}
            {ecues.length === 0 ? (
              <p style={s.ecueVide}>
                Aucun ECUE pour l'instant. Ajoute les matières de ta classe.
              </p>
            ) : (
              <div style={s.ecueList}>
                {ecues.map((e) => (
                  <div key={e.id} style={s.ecueItem}>
                    <div style={s.ecueItemLeft}>
                      <span style={s.ecueDot} />
                      <span style={s.ecueName}>{e.name}</span>
                    </div>
                    <button
                      style={s.btnDel}
                      onClick={() => handleSupprimerEcue(e.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
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
  navRole     : { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: 'var(--blue-500)' },
  btnGhost    : { padding: '7px 14px', background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'var(--font-display)' },

  body        : { maxWidth: '900px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },

  header      : { background: 'linear-gradient(135deg, var(--navy-900), var(--navy-700))', borderRadius: 'var(--radius-xl)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerInfo  : { display: 'flex', flexDirection: 'column', gap: '4px' },
  headerEyebrow: { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: 0 },
  headerTitle : { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 },
  headerMeta  : { fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 },
  delegateBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-lg)', padding: '12px 20px' },
  delegateIcon: { fontSize: '24px' },
  delegateText: { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' },

  grid        : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },

  card        : { background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' },
  cardHeader  : { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  cardIcon    : { width: '40px', height: '40px', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  cardTitle   : { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 4px' },
  cardSub     : { fontSize: '13px', color: 'var(--gray-400)', margin: 0, lineHeight: 1.5 },

  invitEmpty  : { display: 'flex', flexDirection: 'column', gap: '12px' },
  invitEmptyText: { fontSize: '13px', color: 'var(--gray-400)', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' },
  invitResult : { display: 'flex', flexDirection: 'column', gap: '10px' },
  invitBox    : { display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '10px 12px' },
  invitUrl    : { flex: 1, fontSize: '12px', color: 'var(--gray-600)', wordBreak: 'break-all', fontFamily: 'monospace' },
  btnCopy     : { padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' },
  invitNote   : { fontSize: '12px', color: 'var(--amber-600)', background: 'var(--amber-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', margin: 0 },

  ecueForm    : { display: 'flex', gap: '8px' },
  ecueInput   : { flex: 1, padding: '10px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '13px', outline: 'none', background: 'var(--gray-50)', fontFamily: 'var(--font-body)' },
  ecueVide    : { fontSize: '13px', color: 'var(--gray-400)', textAlign: 'center', padding: '20px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' },
  ecueList    : { display: 'flex', flexDirection: 'column', gap: '6px' },
  ecueItem    : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' },
  ecueItemLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  ecueDot     : { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-400)', flexShrink: 0 },
  ecueName    : { fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '500', color: 'var(--gray-700)' },

  erreur      : { fontSize: '12px', color: 'var(--red-600)', background: 'var(--red-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', margin: 0 },

  btnPrimary  : { padding: '10px 20px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'opacity 0.15s' },
  btnSecondary: { padding: '8px 16px', background: 'var(--gray-100)', color: 'var(--gray-600)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '500', fontSize: '13px', cursor: 'pointer' },
  btnDel      : { padding: '4px 8px', background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' },
  tutorial          : { background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-xl)', padding: '24px' },
  tutorialHeader    : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  tutorialTitle     : { fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)' },
  tutorialClose     : { background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '14px', padding: '4px' },
  tutorialSteps     : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  tutorialStep      : { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  tutorialStepIcon  : { fontSize: '20px', flexShrink: 0, marginTop: '2px' },
  tutorialStepTitle : { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: 'var(--navy-900)', margin: '0 0 3px' },
  tutorialStepDesc  : { fontSize: '12px', color: 'var(--gray-500)', margin: 0, lineHeight: 1.5 },
  demandesBadge     : { marginLeft: '8px', padding: '1px 7px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', fontSize: '12px', fontWeight: '700' },
  demandesList      : { display: 'flex', flexDirection: 'column', gap: '8px' },
  demandeItem       : { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' },
  demandeAvatar     : { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '12px', color: '#fff', flexShrink: 0 },
  demandeInfo       : { flex: 1 },
  demandeName       : { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)', margin: 0 },
  demandeMatricule  : { fontSize: '11px', color: 'var(--gray-400)', margin: 0, fontFamily: 'monospace' },
  demandeActions    : { display: 'flex', gap: '6px' },
  btnApprouver      : { padding: '5px 10px', background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer' },
  btnRefuser        : { padding: '5px 10px', background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer' },
};