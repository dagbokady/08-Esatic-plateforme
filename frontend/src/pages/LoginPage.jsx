import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getMe } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate  = useNavigate();
  const { connexion } = useAuth();

  const [form,    setForm]    = useState({ matricule: '', password: '' });
  const [erreur,  setErreur]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      // 1. Connexion → récupère le token
      const res   = await login(form);
      const token = res.data.access_token;

      // 2. Récupère le profil avec ce token
      localStorage.setItem('token', token);
      const profil = await getMe();

      // 3. Stocke dans le context
      connexion(token, profil.data);

      // 4. Redirige vers le dashboard
      navigate('/dashboard');

    } catch (err) {
      setErreur(
        err.response?.data?.detail || 'Matricule ou mot de passe incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <span style={styles.logoIcon}>ES</span>
          <span style={styles.logoText}>EsaticShare</span>
        </div>

        <h2 style={styles.titre}>Connexion</h2>
        <p style={styles.sous_titre}>Connecte-toi avec ton matricule ESATIC</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.champ}>
            <label style={styles.label}>Matricule</label>
            <input
              style={styles.input}
              type="text"
              name="matricule"
              placeholder="Ex : 21INF001"
              value={form.matricule}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {erreur && <p style={styles.erreur}>{erreur}</p>}

          <button
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.lien}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.lienTexte}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page       : { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' },
  card       : { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo       : { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' },
  logoIcon   : { background: '#2563EB', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontWeight: '700', fontSize: '14px' },
  logoText   : { fontWeight: '700', fontSize: '18px', color: '#1E293B' },
  titre      : { fontSize: '22px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' },
  sous_titre : { fontSize: '13px', color: '#94A3B8', marginBottom: '28px' },
  form       : { display: 'flex', flexDirection: 'column', gap: '16px' },
  champ      : { display: 'flex', flexDirection: 'column', gap: '6px' },
  label      : { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input      : { padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#F8FAFC' },
  erreur     : { color: '#DC2626', fontSize: '12px', background: '#FEE2E2', padding: '8px 12px', borderRadius: '6px' },
  btn        : { padding: '11px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  lien       : { textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px' },
  lienTexte  : { color: '#2563EB', fontWeight: '600', textDecoration: 'none' },
};