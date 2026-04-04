// src/pages/UploadPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../services/classService';
import { getEcuesClasse } from '../services/ecueService';
import { uploaderFichier } from '../services/fileService';

const FILE_TYPES = [
  { value: 'cours',   label: 'Cours',          icon: '📘' },
  { value: 'sujet',   label: "Sujet d'examen", icon: '📄' },
  { value: 'corrige', label: 'Corrigé',         icon: '✅' },
  { value: 'td_tp',   label: 'TD / TP',         icon: '📁' },
];

const TAILLE_MAX = 50 * 1024 * 1024;

export default function UploadPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const fileRef     = useRef();

  const [classes,  setClasses]  = useState([]);
  const [ecues,    setEcues]    = useState([]);
  const [form,     setForm]     = useState({
    title    : '',
    file_type: 'cours',
    class_id : '',
    ecue_id  : '',
  });
  const [fichier,  setFichier]  = useState(null);
  const [drag,     setDrag]     = useState(false);
  const [erreur,   setErreur]   = useState('');
  const [succes,   setSucces]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);

  // Charger les classes et mettre la classe de l'utilisateur par défaut
  useEffect(() => {
    getClasses().then((res) => {
      setClasses(res.data);
      // Mettre la classe de l'utilisateur connecté par défaut
      if (user?.class_id) {
        setForm((f) => ({ ...f, class_id: user.class_id }));
      }
    });
  }, [user]);

  // Charger les ECUE quand la classe change
  useEffect(() => {
    if (!form.class_id) {
      setEcues([]);
      setForm((f) => ({ ...f, ecue_id: '' }));
      return;
    }
    getEcuesClasse(form.class_id).then((res) => {
      setEcues(res.data);
      setForm((f) => ({ ...f, ecue_id: '' })); // reset ecue à chaque changement de classe
    }).catch(() => setEcues([]));
  }, [form.class_id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validerFichier = (f) => {
    if (!f) return 'Aucun fichier sélectionné';
    if (f.size > TAILLE_MAX) return 'Fichier trop lourd (max 50 Mo)';
    const typesOk = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'image/png', 'image/jpeg'
    ];
    if (!typesOk.includes(f.type)) return 'Type non autorisé (PDF, Word, ZIP, images)';
    return null;
  };

  const handleFichier = (f) => {
    const err = validerFichier(f);
    if (err) { setErreur(err); return; }
    setErreur('');
    setFichier(f);
    // Pré-remplir le titre avec le nom du fichier sans extension
    if (!form.title) {
      const nomSansExt = f.name.replace(/\.[^.]+$/, '');
      setForm((prev) => ({ ...prev, title: nomSansExt }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFichier(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!fichier)       { setErreur('Sélectionne un fichier'); return; }
    if (!form.class_id) { setErreur('Sélectionne une classe cible'); return; }
    if (!form.ecue_id)  { setErreur('Sélectionne une matière (ECUE)'); return; }

    setLoading(true);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append('fichier',   fichier);
      fd.append('title',     form.title || fichier.name);
      fd.append('file_type', form.file_type);
      fd.append('class_id',  form.class_id);
      fd.append('ecue_id',   form.ecue_id);

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 85));
      }, 200);

      await uploaderFichier(fd);

      clearInterval(interval);
      setProgress(100);
      setSucces('Fichier uploadé avec succès !');
      setTimeout(() => navigate('/dashboard'), 1800);

    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'upload");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const classeSelectionnee = classes.find(c => c.id === form.class_id);
  const formatSize = (bytes) => bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} Mo`
    : `${(bytes / 1024).toFixed(0)} Ko`;

  return (
    <div style={s.root}>
      <div style={s.bgBlob} />

      <div style={s.topBar}>
        <button style={s.retour} onClick={() => navigate('/dashboard')}>
          ← Retour au dashboard
        </button>
      </div>

      <div style={s.wrapper}>
        <div style={s.formSection}>
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>Envoyer un fichier</h1>
            <p style={s.formSub}>Soumets un fichier au vote de ta classe</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>

            {/* ZONE DE DÉPÔT */}
            <div
              style={{
                ...s.dropZone,
                borderColor: drag ? 'var(--blue-400)' : fichier ? 'var(--green-600)' : 'var(--gray-300)',
                background : drag ? 'var(--blue-50)'  : fichier ? 'var(--green-50)'  : 'var(--gray-50)',
              }}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={(e) => handleFichier(e.target.files[0])}
              />
              {fichier ? (
                <div style={s.fileChosen}>
                  <span style={s.fileChosenIcon}>📎</span>
                  <div style={{ flex: 1 }}>
                    <p style={s.fileChosenName}>{fichier.name}</p>
                    <p style={s.fileChosenSize}>{formatSize(fichier.size)}</p>
                  </div>
                  <button
                    type="button"
                    style={s.fileChosenRemove}
                    onClick={(e) => { e.stopPropagation(); setFichier(null); }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={s.dropContent}>
                  <span style={s.dropIcon}>☁️</span>
                  <p style={s.dropText}>Glisse ton fichier ici</p>
                  <p style={s.dropSub}>ou clique pour parcourir</p>
                  <p style={s.dropTypes}>PDF · Word · ZIP · Images — max 50 Mo</p>
                </div>
              )}
            </div>

            {/* TITRE */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Titre</label>
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

            {/* TYPE */}
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
                    <span style={{ ...s.typeLabel, color: form.file_type === t.value ? 'var(--blue-500)' : 'var(--gray-600)' }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CLASSE CIBLE */}
            <div style={s.fieldWrap}>
              <label style={s.label}>
                Classe cible
                {classeSelectionnee && form.class_id === user?.class_id && (
                  <span style={s.maClasseTag}>Ma classe</span>
                )}
              </label>
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
                    {c.id === user?.class_id ? ' (ma classe)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* ECUE — obligatoire */}
            <div style={s.fieldWrap}>
              <label style={s.label}>
                Matière (ECUE) <span style={s.required}>obligatoire</span>
              </label>
              {ecues.length === 0 ? (
                <div style={s.ecueVide}>
                  {form.class_id
                    ? '⚠️ Aucune matière configurée pour cette classe. Demande au délégué d\'en ajouter.'
                    : 'Sélectionne d\'abord une classe.'
                  }
                </div>
              ) : (
                <select
                  style={s.select}
                  name="ecue_id"
                  value={form.ecue_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionne une matière</option>
                  {ecues.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              )}
            </div>

            {erreur && (
              <div style={s.alert}>⚠️ {erreur}</div>
            )}
            {succes && (
              <div style={{ ...s.alert, background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid #BBF7D0' }}>
                ✅ {succes}
              </div>
            )}

            {loading && (
              <div style={s.progressWrap}>
                <div style={s.progressTrack}>
                  <div style={{ ...s.progressFill, width: `${progress}%` }} />
                </div>
                <span style={s.progressText}>{progress}%</span>
              </div>
            )}

            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit"
              disabled={loading || ecues.length === 0}
            >
              {loading ? 'Upload en cours...' : 'Soumettre au vote →'}
            </button>

          </form>
        </div>

        {/* PANNEAU INFO */}
        <div style={s.infoSection}>
          <div style={s.infoCard}>
            <h3 style={s.infoTitle}>Comment ça fonctionne</h3>
            <div style={s.infoSteps}>
              {[
                { num: '1', title: 'Tu uploades',    desc: 'Le fichier est stocké de façon sécurisée' },
                { num: '2', title: 'Vote si externe', desc: '70% requis si tu envoies dans une autre classe' },
                { num: '3', title: 'Accessible',      desc: 'Téléchargeable par les membres de la classe' },
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
          {(fichier || form.class_id) && (
            <div style={s.preview}>
              <p style={s.previewLabel}>Aperçu</p>
              <div style={s.previewCard}>
                <div style={s.previewTop}>
                  <span>{FILE_TYPES.find(t => t.value === form.file_type)?.icon}</span>
                  <span style={s.previewStatus}>
                    {form.class_id === user?.class_id ? '✓ Direct' : 'En attente'}
                  </span>
                </div>
                <p style={s.previewTitle}>
                  {form.title || fichier?.name || 'Titre du fichier'}
                </p>
                {classeSelectionnee && (
                  <p style={s.previewClasse}>
                    → {classeSelectionnee.niveau} · {classeSelectionnee.filiere}
                  </p>
                )}
                {form.ecue_id && (
                  <p style={s.previewEcue}>
                    📚 {ecues.find(e => e.id === form.ecue_id)?.name}
                  </p>
                )}
                {fichier && (
                  <p style={s.previewSize}>{formatSize(fichier.size)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root         : { minHeight: '100vh', background: 'var(--gray-50)', position: 'relative', overflow: 'hidden' },
  bgBlob       : { position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  topBar       : { padding: '16px 32px', borderBottom: '1px solid var(--gray-200)', background: 'var(--white)' },
  retour       : { background: 'none', border: 'none', color: 'var(--blue-500)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '500', padding: 0 },
  wrapper      : { maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' },
  formSection  : { display: 'flex', flexDirection: 'column', gap: '24px' },
  formHeader   : { display: 'flex', flexDirection: 'column', gap: '6px' },
  formTitle    : { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', color: 'var(--navy-900)' },
  formSub      : { fontSize: '14px', color: 'var(--gray-400)' },
  form         : { background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' },

  dropZone     : { border: '2px dashed', borderRadius: 'var(--radius-lg)', padding: '32px 20px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  dropContent  : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  dropIcon     : { fontSize: '32px' },
  dropText     : { fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '15px', color: 'var(--navy-800)', margin: 0 },
  dropSub      : { fontSize: '13px', color: 'var(--gray-400)', margin: 0 },
  dropTypes    : { fontSize: '11px', color: 'var(--gray-300)', margin: '4px 0 0' },
  fileChosen   : { display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' },
  fileChosenIcon: { fontSize: '28px' },
  fileChosenName: { fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', color: 'var(--navy-800)', margin: 0 },
  fileChosenSize: { fontSize: '11px', color: 'var(--green-600)', margin: 0 },
  fileChosenRemove: { background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '14px', padding: '4px' },

  fieldWrap    : { display: 'flex', flexDirection: 'column', gap: '8px' },
  label        : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' },
  maClasseTag  : { padding: '1px 7px', borderRadius: '10px', background: 'var(--blue-50)', color: 'var(--blue-500)', fontSize: '10px', fontWeight: '600', textTransform: 'none', letterSpacing: 0 },
  required     : { color: 'var(--red-600)', fontSize: '10px', textTransform: 'none', letterSpacing: 0 },
  input        : { padding: '12px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', width: '100%' },
  select       : { padding: '12px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-800)', width: '100%' },
  ecueVide     : { padding: '12px 14px', background: 'var(--amber-50)', color: 'var(--amber-600)', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid #FDE68A' },
  typeGrid     : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  typeCard     : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 10px', border: '1.5px solid', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' },
  typeIcon     : { fontSize: '20px' },
  typeLabel    : { fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600', textAlign: 'center' },

  alert        : { padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #FECDD3' },
  progressWrap : { display: 'flex', alignItems: 'center', gap: '10px' },
  progressTrack: { flex: 1, height: '6px', background: 'var(--gray-100)', borderRadius: '3px', overflow: 'hidden' },
  progressFill : { height: '100%', background: 'linear-gradient(90deg, var(--blue-500), var(--blue-300))', borderRadius: '3px', transition: 'width 0.3s ease' },
  progressText : { fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600', color: 'var(--blue-500)', minWidth: '36px' },
  btn          : { padding: '13px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'opacity 0.15s' },

  infoSection  : { display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px' },
  infoCard     : { background: 'linear-gradient(150deg, var(--navy-900), var(--navy-700))', borderRadius: 'var(--radius-xl)', padding: '24px' },
  infoTitle    : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
  infoSteps    : { display: 'flex', flexDirection: 'column', gap: '16px' },
  infoStep     : { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  infoStepNum  : { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0, marginTop: '2px' },
  infoStepTitle: { fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' },
  infoStepDesc : { fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },

  preview      : { display: 'flex', flexDirection: 'column', gap: '8px' },
  previewLabel : { fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  previewCard  : { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: 'var(--shadow-sm)' },
  previewTop   : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewStatus: { fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'var(--amber-50)', color: 'var(--amber-600)', fontFamily: 'var(--font-display)', fontWeight: '600' },
  previewTitle : { fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)', fontFamily: 'var(--font-display)', margin: 0 },
  previewClasse: { fontSize: '11px', color: 'var(--blue-500)', margin: 0 },
  previewEcue  : { fontSize: '11px', color: 'var(--gray-500)', margin: 0 },
  previewSize  : { fontSize: '11px', color: 'var(--gray-400)', margin: 0 },
};