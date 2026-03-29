// src/pages/UploadPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClasses } from '../services/classService';
import { uploaderFichier } from '../services/fileService';

const FILE_TYPES = [
  { value: 'cours',   label: 'Cours',          icon: '📘' },
  { value: 'sujet',   label: "Sujet d'examen", icon: '📄' },
  { value: 'corrige', label: 'Corrigé',         icon: '✅' },
  { value: 'td_tp',   label: 'TD / TP',         icon: '📁' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [classes,  setClasses]  = useState([]);
  const [form,     setForm]     = useState({ title: '', file_type: 'cours', class_id: '' });
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
      await uploaderFichier(form);
      setSucces('Fichier soumis avec succès !');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const classeSelectionnee = classes.find(c => c.id === form.class_id);

  return (
    <div style={s.root}>
      <div style={s.bgBlob} />

      {/* HEADER */}
      <div style={s.topBar}>
        <button style={s.retour} onClick={() => navigate('/dashboard')}>
          ← Retour au dashboard
        </button>
      </div>

      <div style={s.wrapper}>
        {/* FORMULAIRE */}
        <div style={s.formSection}>
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>Envoyer un fichier</h1>
            <p style={s.formSub}>
              Soumets un fichier au vote de ta classe
            </p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>

            {/* TITRE */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Titre du fichier</label>
              <input
                style={s.input}
                type="text"
                name="title"
                placeholder="Ex : Examen final BDD — Session 1"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* TYPE — sélection visuelle */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Type de fichier</label>
              <div style={s.typeGrid}>
                {FILE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    style={{
                      ...s.typeCard,
                      borderColor: form.file_type === t.value ? 'var(--blue-400)' : 'var(--gray-200)',
                      background : form.file_type === t.value ? 'var(--blue-50)'  : 'var(--white)',
                      boxShadow  : form.file_type === t.value ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                    }}
                    onClick={() => setForm({ ...form, file_type: t.value })}
                  >
                    <span style={s.typeIcon}>{t.icon}</span>
                    <span style={{
                      ...s.typeLabel,
                      color: form.file_type === t.value ? 'var(--blue-500)' : 'var(--gray-600)',
                    }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CLASSE CIBLE */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Classe cible</label>
              <select
                style={s.select}
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

            {erreur && (
              <div style={s.alert}>
                <span>⚠️</span> {erreur}
              </div>
            )}
            {succes && (
              <div style={{ ...s.alert, background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0' }}>
                <span>✅</span> {succes}
              </div>
            )}

            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Soumettre au vote →'}
            </button>
          </form>
        </div>

        {/* PANNEAU INFO */}
        <div style={s.infoSection}>
          <div style={s.infoCard}>
            <h3 style={s.infoTitle}>Comment ça fonctionne</h3>
            <div style={s.infoSteps}>
              {[
                { num: '1', title: 'Tu soumets',    desc: 'Le fichier est envoyé en attente de validation' },
                { num: '2', title: 'La classe vote', desc: '70% des membres doivent approuver le fichier' },
                { num: '3', title: 'Accessible',     desc: 'Le fichier devient visible pour toute la classe' },
              ].map((step) => (
                <div key={step.num} style={s.infoStep}>
                  <div style={s.infoStepNum}>{step.num}</div>
                  <div>
                    <p style={s.infoStepTitle}>{step.title}</p>
                    <p style={s.infoStepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APERÇU */}
          {(form.title || form.class_id) && (
            <div style={s.preview}>
              <p style={s.previewLabel}>Aperçu</p>
              <div style={s.previewCard}>
                <div style={s.previewTop}>
                  <span style={s.previewIcon}>
                    {FILE_TYPES.find(t => t.value === form.file_type)?.icon}
                  </span>
                  <span style={s.previewStatus}>En attente</span>
                </div>
                <p style={s.previewTitle}>{form.title || 'Titre du fichier'}</p>
                {classeSelectionnee && (
                  <p style={s.previewClasse}>
                    {classeSelectionnee.niveau} · {classeSelectionnee.filiere}
                  </p>
                )}
                <div style={s.previewVote}>
                  <div style={s.previewBar}><div style={{ ...s.previewFill, width: '0%' }} /></div>
                  <span style={s.previewVoteLbl}>0% — en attente des votes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root        : { minHeight: '100vh', background: 'var(--gray-50)', position: 'relative', overflow: 'hidden' },
  bgBlob      : { position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  topBar      : { padding: '16px 32px', borderBottom: '1px solid var(--gray-200)', background: 'var(--white)' },
  retour      : { background: 'none', border: 'none', color: 'var(--blue-500)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '500', padding: 0 },
  wrapper     : { maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' },
  formSection : { display: 'flex', flexDirection: 'column', gap: '28px' },
  formHeader  : { display: 'flex', flexDirection: 'column', gap: '6px' },
  formTitle   : { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', color: 'var(--navy-900)' },
  formSub     : { fontSize: '14px', color: 'var(--gray-400)' },
  form        : { background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldWrap   : { display: 'flex', flexDirection: 'column', gap: '8px' },
  label       : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input       : { padding: '12px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', width: '100%', transition: 'border-color 0.2s' },
  select      : { padding: '12px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', width: '100%' },
  typeGrid    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  typeCard    : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 10px', border: '1.5px solid', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' },
  typeIcon    : { fontSize: '20px' },
  typeLabel   : { fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600', textAlign: 'center' },
  alert       : { padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3', display: 'flex', gap: '8px', alignItems: 'center' },
  btn         : { padding: '13px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'opacity 0.15s' },

  /* INFO */
  infoSection : { display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px' },
  infoCard    : { background: 'linear-gradient(150deg, var(--navy-900), var(--navy-700))', borderRadius: 'var(--radius-xl)', padding: '24px' },
  infoTitle   : { fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' },
  infoSteps   : { display: 'flex', flexDirection: 'column', gap: '16px' },
  infoStep    : { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoStepNum : { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0, marginTop: '2px' },
  infoStepTitle: { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' },
  infoStepDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },

  /* PREVIEW */
  preview     : { display: 'flex', flexDirection: 'column', gap: '10px' },
  previewLabel: { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  previewCard : { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' },
  previewTop  : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewIcon : { fontSize: '20px' },
  previewStatus: { fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'var(--amber-50)', color: 'var(--amber-600)', fontFamily: 'var(--font-display)', fontWeight: '600' },
  previewTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)', fontFamily: 'var(--font-display)', margin: 0 },
  previewClasse: { fontSize: '11px', color: 'var(--gray-400)', margin: 0 },
  previewVote : { display: 'flex', flexDirection: 'column', gap: '4px' },
  previewBar  : { height: '4px', background: 'var(--gray-100)', borderRadius: '2px' },
  previewFill : { height: '100%', background: 'var(--blue-400)', borderRadius: '2px' },
  previewVoteLbl: { fontSize: '10px', color: 'var(--gray-300)' },
};