// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { getClasses } from '../services/classService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [classes,  setClasses]  = useState([]);
  const [form,     setForm]     = useState({ matricule: '', full_name: '', password: '', class_id: '' });
  const [erreur,   setErreur]   = useState('');
  const [succes,   setSucces]   = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      await register(form);
      setSucces('Compte créé ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.bgBlob} />

      <div style={s.card}>
        <div style={s.cardLeft}>
          <div style={s.logo}>
            <div style={s.logoMark}><span style={s.logoLetters}>ES</span></div>
            <span style={s.logoText}>EsaticShare</span>
          </div>
          <div style={s.leftContent}>
            <h1 style={s.leftTitle}>Rejoins ta promotion</h1>
            <p style={s.leftSub}>Crée ton compte et accède aux ressources partagées par tes camarades.</p>
            <div style={s.steps}>
              {['Crée ton compte', 'Rejoins ta classe via invitation', 'Accède aux fichiers'].map((step, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepNum}>{i + 1}</div>
                  <span style={s.stepText}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={s.cardRight}>
          <h2 style={s.title}>Inscription</h2>
          <p style={s.sub}>Quelques informations pour commencer</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <Field label="Nom complet" name="full_name"
                     placeholder="Kouassi Jean" value={form.full_name}
                     onChange={handleChange} />
              <Field label="Matricule" name="matricule"
                     placeholder="21INF001" value={form.matricule}
                     onChange={handleChange} />
            </div>

            <div style={s.fieldWrap}>
              <label style={s.label}>Classe</label>
              <select style={s.select} name="class_id"
                      value={form.class_id} onChange={handleChange} required>
                <option value="">Sélectionne ta classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.niveau} · {c.filiere}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Mot de passe" name="password" type="password"
                   placeholder="••••••••" value={form.password}
                   onChange={handleChange} />

            {erreur && <Alert type="error">{erreur}</Alert>}
            {succes && <Alert type="success">{succes}</Alert>}

            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit" disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </form>

          <p style={s.switchLink}>
            Déjà un compte ?{' '}
            <Link to="/login" style={s.link}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
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
    <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', background: colors[type].bg, color: colors[type].color }}>
      {children}
    </div>
  );
}

const s = {
  root      : { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '24px', position: 'relative', overflow: 'hidden' },
  bgBlob    : { position: 'fixed', top: '-200px', right: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  card      : { display: 'flex', width: '100%', maxWidth: '860px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', animation: 'fadeUp 0.5s ease' },
  cardLeft  : { width: '42%', background: 'linear-gradient(150deg, var(--navy-900), var(--navy-700))', padding: '44px 36px', display: 'flex', flexDirection: 'column', gap: '40px' },
  logo      : { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark  : { width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' },
  logoLetters: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '13px', color: '#fff' },
  logoText  : { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: '#fff' },
  leftContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  leftTitle : { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: '#fff', lineHeight: 1.3 },
  leftSub   : { fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 },
  steps     : { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' },
  step      : { display: 'flex', alignItems: 'center', gap: '12px' },
  stepNum   : { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  stepText  : { fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  cardRight : { flex: 1, background: 'var(--white)', padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: '20px' },
  title     : { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--gray-800)' },
  sub       : { fontSize: '13px', color: 'var(--gray-400)', marginTop: '-12px' },
  form      : { display: 'flex', flexDirection: 'column', gap: '14px' },
  row       : { display: 'flex', gap: '12px' },
  fieldWrap : { display: 'flex', flexDirection: 'column', gap: '6px' },
  label     : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input     : { padding: '11px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%' },
  select    : { padding: '11px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', width: '100%' },
  btn       : { padding: '12px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'opacity 0.15s' },
  switchLink: { textAlign: 'center', fontSize: '13px', color: 'var(--gray-400)' },
  link      : { color: 'var(--blue-500)', fontWeight: '600', textDecoration: 'none' },
};