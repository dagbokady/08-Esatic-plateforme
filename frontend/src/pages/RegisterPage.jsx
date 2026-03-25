import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { getClasses } from '../services/classService';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [classes,  setClasses]  = useState([]);
  const [form,     setForm]     = useState({ matricule: '', full_name: '', password: '', class_id: '' });
  const [erreur,   setErreur]   = useState('');
  const [loading,  setLoading]  = useState(false);

  // Charger les classes au montage du composant
  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setErreur(err.response?.data?.detail || 'Erreur lors de l\'inscription');
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

        <h2 style={styles.titre}>Inscription</h2>
        <p style={styles.sous_titre}>Crée ton compte avec ton matricule ESATIC</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.champ}>
            <label style={styles.label}>Nom complet</label>
            <input style={styles.input} type="text" name="full_name"
                   placeholder="Kouassi Jean" value={form.full_name}
                   onChange={handleChange} required />
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Matricule</label>
            <input style={styles.input} type="text" name="matricule"
                   placeholder="Ex : 21INF001" value={form.matricule}
                   onChange={handleChange} required />
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Classe</label>
            <select style={styles.input} name="class_id"
                    value={form.class_id} onChange={handleChange} required>
              <option value="">Sélectionne ta classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.niveau} · {c.filiere}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Mot de passe</label>
            <input style={styles.input} type="password" name="password"
                   placeholder="••••••••" value={form.password}
                   onChange={handleChange} required />
          </div>

          {erreur && <p style={styles.erreur}>{erreur}</p>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
                  type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.lien}>
          Déjà un compte ?{' '}
          <Link to="/login" style={styles.lienTexte}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page      : { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', width: '100%' },
  card      : { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo      : { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' },
  logoIcon  : { background: '#2563EB', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontWeight: '700', fontSize: '14px' },
  logoText  : { fontWeight: '700', fontSize: '18px', color: '#1E293B' },
  titre     : { fontSize: '22px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' },
  sous_titre: { fontSize: '13px', color: '#94A3B8', marginBottom: '28px' },
  form      : { display: 'flex', flexDirection: 'column', gap: '16px' },
  champ     : { display: 'flex', flexDirection: 'column', gap: '6px' },
  label     : { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input     : { padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#F8FAFC' },
  erreur    : { color: '#DC2626', fontSize: '12px', background: '#FEE2E2', padding: '8px 12px', borderRadius: '6px' },
  btn       : { padding: '11px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  lien      : { textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px' },
  lienTexte : { color: '#2563EB', fontWeight: '600', textDecoration: 'none' },
};
