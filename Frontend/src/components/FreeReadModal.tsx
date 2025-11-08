import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FreeReadModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div style={styles.overlay} aria-modal="true" role="dialog">
      <div style={styles.modal}>
        <h2 style={styles.title}>¡Has alcanzado tu límite de lectura!</h2>
        <p style={styles.desc}>
          Regístrate para obtener acceso ilimitado a todos nuestros artículos, noticias y contenido exclusivo.
        </p>

        <p style={styles.highlight}>Es rápido, fácil y gratuito.</p>

        <div style={styles.actions}>
          <Link to="/register" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={styles.primaryBtn}>Crear una cuenta</button>
          </Link>

          <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={styles.secondaryBtn}>Ya tengo una cuenta</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: 20,
  },
  modal: {
    background: 'linear-gradient(180deg, #eaf9f6 0%, #ffffff 30%)',
    borderRadius: 12,
    maxWidth: 520,
    width: '100%',
    padding: '28px 24px 20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    position: 'relative',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.1)',
    background: '#fff',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  title: {
    margin: '6px 0 8px',
    fontSize: 20,
    color: '#083845',
    fontWeight: 700,
  },
  desc: {
    color: '#245e5b',
    fontSize: 14,
    margin: '0 0 12px',
  },
  highlight: {
    color: '#21b0a6',
    fontWeight: 700,
    marginBottom: 16,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    background: '#21b0a6',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    width: '100%'
  },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.08)',
    color: '#114',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%'
  }
};
