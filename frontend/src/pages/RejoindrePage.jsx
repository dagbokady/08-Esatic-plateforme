// src/pages/RejoindrePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rejoindre } from '../services/classService';
import { useAuth } from '../context/AuthContext';

export default function RejoindrePage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [status,   setStatus]  = useState('loading');
  const [message,  setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/rejoindre/${token}`);
      return;
    }

    rejoindre(token)
      .then((res) => {
        setMessage(res.data.message);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2500);
      })
      .catch((err) => {
        setMessage(err.response?.data?.detail || 'Lien invalide ou expiré');
        setStatus('error');
      });
  }, [token, user]);

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoMark}>ES</div>
          <span style={s.logoText}>EsaticShare</span>
        </div>

        {status === 'loading' && (
          <div style={s.content}>
            <div style={s.spinner} />
            <p style={s.text}>Vérification du lien...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={s.content}>
            <div style={s.iconSuccess}>✓</div>
            <h2 style={s.title}>Bienvenue dans la classe !</h2>
            <p style={s.text}>{message}</p>
            <p style={s.redirect}>Redirection vers le dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={s.content}>
            <div style={s.iconError}>✕</div>
            <h2 style={s.title}>Lien invalide</h2>
            <p style={s.text}>{message}</p>
            <button style={s.btn} onClick={() => navigate('/dashboard')}>
              Retour au dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root      : { minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card      : { background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: '420px', width: '100%', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', textAlign: 'center' },
  logoWrap  : { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark  : { width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-700))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '13px', color: '#fff' },
  logoText  : { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--navy-900)' },
  content   : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' },
  spinner   : { width: '36px', height: '36px', border: '3px solid var(--gray-200)', borderTop: '3px solid var(--blue-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  iconSuccess: { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'var(--green-600)', fontWeight: '700' },
  iconError : { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--red-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'var(--red-600)', fontWeight: '700' },
  title     : { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 },
  text      : { fontSize: '14px', color: 'var(--gray-500)', margin: 0 },
  redirect  : { fontSize: '12px', color: 'var(--gray-300)', margin: 0 },
  btn       : { padding: '10px 24px', background: 'linear-gradient(135deg, var(--blue-500), var(--navy-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '8px' },
};