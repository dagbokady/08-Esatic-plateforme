// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getMe } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate      = useNavigate();
  const { connexion } = useAuth();
  const [form,    setForm]    = useState({ matricule: '', password: '' });
  const [erreur,  setErreur]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      console.log(form);
      const res    = await login(form);
      const token  = res.data.access_token;
      localStorage.setItem('token', token);
      const profil = await getMe();
      connexion(token, profil.data);
      navigate('/dashboard');
    } catch (err) {
      setErreur(err.response?.data?.detail || 'Matricule ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Fond décoratif */}
      <div style={s.bgBlob1} />
      <div style={s.bgBlob2} />

      <div style={s.wrapper}>
        {/* PANNEAU GAUCHE */}
        <div style={s.left}>
          <div style={s.leftInner}>
            <div style={s.logo}>
              <div style={s.logoMark}>
                <span style={s.logoLetters}>ES</span>
              </div>
              <span style={s.logoText}>EsaticShare</span>
            </div>

            <div style={s.heroText}>
              <h1 style={s.heroTitle}>
                La bibliothèque numérique de l'ESATIC
              </h1>
              <p style={s.heroSub}>
                Cours, sujets d'examens, corrigés — partagés et validés
                par ta promotion.
              </p>
            </div>

            <div style={s.statsRow}>
              {[
                { val: '8',   lbl: 'Niveaux' },
                { val: '16+', lbl: 'Filières' },
                { val: '70%', lbl: 'Vote requis' },
              ].map((st) => (
                <div key={st.lbl} style={s.statItem}>
                  <span style={s.statVal}>{st.val}</span>
                  <span style={s.statLbl}>{st.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div style={s.right}>
          <div style={s.formCard}>
            <div style={s.formHeader}>
              <h2 style={s.formTitle}>Bienvenue 👋</h2>
              <p style={s.formSub}>Connecte-toi avec ton matricule ESATIC</p>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              <Field label="Matricule" name="matricule"
                     placeholder="Ex : 21INF001" value={form.matricule}
                     onChange={handleChange} />
              <Field label="Mot de passe" name="password" type="password"
                     placeholder="••••••••" value={form.password}
                     onChange={handleChange} />

              {erreur && <Alert type="error">{erreur}</Alert>}

              <Btn loading={loading}>
                {loading ? 'Connexion...' : 'Se connecter →'}
              </Btn>
            </form>

            <p style={s.switchLink}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={s.link}>S'inscrire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Composants locaux ── */
function Field({ label, name, type = 'text', placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={s.label}>{label}</label>
      <input
        style={{
          ...s.input,
          borderColor: focused ? 'var(--blue-400)' : 'var(--gray-200)',
          boxShadow  : focused ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
        }}
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
      />
    </div>
  );
}

function Alert({ type, children }) {
  const colors = {
    error  : { bg: 'var(--red-50)',   color: 'var(--red-600)' },
    success: { bg: 'var(--green-50)', color: 'var(--green-600)' },
  };
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius-md)',
      fontSize: '13px', lineHeight: 1.5,
      background: colors[type].bg,
      color: colors[type].color,
    }}>
      {children}
    </div>
  );
}

function Btn({ loading, children, onClick, variant = 'primary' }) {
  return (
    <button
      style={{
        ...s.btn,
        opacity: loading ? 0.75 : 1,
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => { if (!loading) e.target.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
      disabled={loading}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const s = {
  root    : { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', position: 'relative', overflow: 'hidden', padding: '24px' },
  bgBlob1 : { position: 'fixed', top: '-120px', left: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  bgBlob2 : { position: 'fixed', bottom: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  wrapper : { display: 'flex', width: '100%', maxWidth: '900px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', animation: 'fadeUp 0.5s ease', minHeight: '560px' },
  left    : { width: '52%', background: 'linear-gradient(150deg, var(--navy-900) 0%, var(--navy-700) 100%)', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  leftInner: { display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', zIndex: 1 },
  logo    : { display: 'flex', alignItems: 'center', gap: '12px' },
  logoMark: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' },
  logoLetters: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', color: '#fff' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: '#fff' },
  heroText: { display: 'flex', flexDirection: 'column', gap: '12px' },
  heroTitle: { fontSize: '26px', fontWeight: '700', color: '#fff', lineHeight: 1.3 },
  heroSub : { fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 },
  statsRow: { display: 'flex', gap: '28px' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statVal : { fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: '#fff' },
  statLbl : { fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  right   : { flex: 1, background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' },
  formCard: { width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' },
  formHeader: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formTitle: { fontSize: '22px', fontWeight: '700', color: 'var(--gray-800)' },
  formSub : { fontSize: '13px', color: 'var(--gray-400)' },
  form    : { display: 'flex', flexDirection: 'column', gap: '14px' },
  label   : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input   : { padding: '11px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%' },
  btn     : { padding: '12px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  switchLink: { textAlign: 'center', fontSize: '13px', color: 'var(--gray-400)' },
  link    : { color: 'var(--blue-500)', fontWeight: '600', textDecoration: 'none' },
};