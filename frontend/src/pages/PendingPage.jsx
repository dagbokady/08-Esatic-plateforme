// src/pages/PendingPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PendingPage() {
  const { deconnexion } = useAuth();
  const navigate        = useNavigate();

  return (
    <div style={s.root}>
      <div style={s.bgBlob1} />
      <div style={s.bgBlob2} />

      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoMark}>ES</div>
          <span style={s.logoText}>EsaticShare</span>
        </div>

        <div style={s.iconWrap}>
          <span style={s.icon}>⏳</span>
        </div>

        <h2 style={s.titre}>Inscription en attente</h2>

        <p style={s.texte}>
          Ton compte a bien été créé. Le <strong>délégué de ta classe</strong> doit
          valider ton inscription avant que tu puisses accéder à la plateforme.
        </p>

        <div style={s.steps}>
          {[
            { icon: '✅', text: 'Compte créé avec succès' },
            { icon: '⏳', text: 'Validation par le délégué en cours...' },
            { icon: '🔓', text: 'Accès à la plateforme' },
          ].map((step, i) => (
            <div key={i} style={{
              ...s.step,
              opacity: i === 0 ? 1 : i === 1 ? 0.8 : 0.4,
            }}>
              <span style={s.stepIcon}>{step.icon}</span>
              <span style={s.stepText}>{step.text}</span>
            </div>
          ))}
        </div>

        <div style={s.infoBox}>
          <span>ℹ️</span>
          <p style={s.infoText}>
            Contacte le délégué de ta classe pour accélérer la validation.
            Une fois approuvé, connecte-toi avec ton matricule et mot de passe.
          </p>
        </div>

        <button
          style={s.btn}
          onClick={() => { deconnexion(); navigate('/login'); }}
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

const s = {
  root    : { minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' },
  bgBlob1 : { position: 'fixed', top: '-150px', left: '-150px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  bgBlob2 : { position: 'fixed', bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', pointerEvents: 'none' },
  card    : { background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' },
  logo    : { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '13px', color: '#fff' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--navy-900)' },
  iconWrap: { width: '72px', height: '72px', borderRadius: '50%', background: 'var(--amber-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  icon    : { fontSize: '32px' },
  titre   : { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 },
  texte   : { fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.7, margin: 0 },
  steps   : { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '16px' },
  step    : { display: 'flex', alignItems: 'center', gap: '10px' },
  stepIcon: { fontSize: '16px', flexShrink: 0 },
  stepText: { fontSize: '13px', color: 'var(--gray-600)', fontFamily: 'var(--font-display)', fontWeight: '500', textAlign: 'left' },
  infoBox : { display: 'flex', gap: '10px', background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'left' },
  infoText: { fontSize: '12px', color: 'var(--blue-700)', lineHeight: 1.5, margin: 0 },
  btn     : { padding: '11px 24px', background: 'var(--gray-100)', color: 'var(--gray-600)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
};