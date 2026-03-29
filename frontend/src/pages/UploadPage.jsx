// src/pages/UploadPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../services/classService';
import { uploaderFichier } from '../services/fileService';

const FILE_TYPES = [
  { value: 'cours',   label: 'Cours' },
  { value: 'sujet',   label: "Sujet d'examen" },
  { value: 'corrige', label: 'Corrigé' },
  { value: 'td_tp',   label: 'TD / TP' },
];

export default function UploadPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [classes,  setClasses]  = useState([]);
  const [form,     setForm]     = useState({
    title    : '',
    file_type: 'cours',
    class_id : '',
  });
  const [erreur,   setErreur]   = useState('');
  const [succes,   setSucces]   = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    getClasses().then((res) => {
      // Ne montrer que les classes de niveau <= au sien
      setClasses(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    setLoading(true);

    try {
      await uploaderFichier(form);
      setSucces('Fichier soumis avec succès — en attente de validation par 70% des membres.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <button style={styles.retour} onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h2 style={styles.titre}>Envoyer un fichier</h2>
          <p style={styles.sous_titre}>
            Le fichier sera soumis au vote de la classe avant d'être accessible.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* TITRE */}
          <div style={styles.champ}>
            <label style={styles.label}>Titre du fichier</label>
            <input
              style={styles.input}
              type="text"
              name="title"
              placeholder="Ex : Examen final BDD — Session 1"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* TYPE */}
          <div style={styles.champ}>
            <label style={styles.label}>Type</label>
            <select
              style={styles.input}
              name="file_type"
              value={form.file_type}
              onChange={handleChange}
              required
            >
              {FILE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* CLASSE CIBLE */}
          <div style={styles.champ}>
            <label style={styles.label}>Classe cible</label>
            <select
              style={styles.input}
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionne une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.niveau} · {c.filiere}
                </option>
              ))}
            </select>
          </div>

          {/* INFO VOTE */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <p style={styles.infoTexte}>
              Le fichier sera visible uniquement après validation par
              <strong> 70% des membres</strong> de la classe cible.
            </p>
          </div>

          {erreur && <p style={styles.erreur}>{erreur}</p>}
          {succes && <p style={styles.succes}>{succes}</p>}

          <button
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Soumettre au vote →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page      : { minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card      : { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  header    : { marginBottom: '28px' },
  retour    : { background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '12px' },
  titre     : { fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 6px' },
  sous_titre: { fontSize: '13px', color: '#94A3B8', margin: 0 },
  form      : { display: 'flex', flexDirection: 'column', gap: '16px' },
  champ     : { display: 'flex', flexDirection: 'column', gap: '6px' },
  label     : { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input     : { padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#F8FAFC' },
  infoBox   : { display: 'flex', gap: '10px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '12px' },
  infoIcon  : { fontSize: '14px', flexShrink: 0 },
  infoTexte : { fontSize: '12px', color: '#1D4ED8', margin: 0, lineHeight: 1.5 },
  erreur    : { color: '#DC2626', fontSize: '12px', background: '#FEE2E2', padding: '8px 12px', borderRadius: '6px' },
  succes    : { color: '#166534', fontSize: '12px', background: '#DCFCE7', padding: '8px 12px', borderRadius: '6px' },
  btn       : { padding: '11px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
};