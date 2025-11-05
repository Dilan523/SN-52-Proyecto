import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import type { Noticia } from '../../services/noticias';
import getAllArticles from '../../data/allArticles';
import './noticia.css';
import { UserContext } from '../../context/UserContext';
import FreeReads from '../../services/freeReads';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { toggleLikeNoticia, toggleSaveNoticia, shareNoticia } from '../../services/noticias';
import CommentsModal from '../../components/CommentsModal';

const NoticiaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [articulo, setArticulo] = useState<Noticia | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    // Primero intentar obtener el artículo desde location.state
    const stateAny = (location.state as any) || null;
    if (stateAny && stateAny.article) {
      setArticulo(stateAny.article as Noticia);
      return;
    }

    // Si no viene por state, buscar por id en la fuente centralizada
    if (id) {
      const all = getAllArticles();
      const found = all.find(a => String(a.id) === String(id));
      if (found) setArticulo(found);
    }
  }, [id, location.state]);

  // consumir una lectura gratuita cuando un usuario no registrado abre el artículo
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (!articulo || user) return;

    // Verificar lecturas disponibles y consumir si hay
    const currentRemaining = FreeReads.getRemaining();
    console.log('Lecturas disponibles al abrir artículo:', currentRemaining);

    if (currentRemaining > 0) {
      try {
        const result = FreeReads.consumeFreeRead();
        console.log('Lectura consumida, restantes:', result.remaining);
      } catch (e) {
        console.warn('Error al consumir lectura:', e);
      }
    }
  }, [articulo, user]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toggleLikeNoticia(articulo!.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toggleSaveNoticia(articulo!.id);
  };

  const handleShare = () => {
    shareNoticia(articulo!);
  };

  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
  };

  if (!articulo) return <div style={{ padding: 24 }}>Artículo no encontrado.</div>;
  // si el contenido contiene etiquetas HTML, renderizarlo como HTML seguro
  const raw = articulo.contenido || '';
  // eliminar scripts por seguridad mínima
  const safeHtml = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  return (
    <main className="noticia-page">
      <div className="noticia-card">
        <header className="noticia-header">
          <h1 className="noticia-title">{articulo.titulo}</h1>
          <div className="noticia-meta">
            <span className="categoria">{articulo.categoria}</span>
            <span className="fecha">{new Date(articulo.fecha).toLocaleDateString('es-ES')}</span>
            <span className="autor">{articulo.autor}</span>
          </div>
        </header>

        {articulo.imagen && <img className="noticia-image" src={articulo.imagen} alt={articulo.titulo} />}

        <section className="noticia-content">
          {/* renderizamos HTML si existe */}
          {safeHtml.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : (
            <p>{safeHtml}</p>
          )}
        </section>

        {/* Botones de acciones */}
        <div className="noticia-actions">
          <button
            onClick={handleLike}
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
          >
            <Heart size={16} />
            <span>{articulo.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button
            onClick={handleOpenComments}
            className="action-btn comment-btn"
          >
            <MessageCircle size={16} />
            <span>{articulo.comentarios}</span>
          </button>
          <button
            onClick={handleShare}
            className="action-btn share-btn"
          >
            <Share2 size={16} />
            <span>{articulo.compartidos}</span>
          </button>
          <button
            onClick={handleSave}
            className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
          >
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={handleCloseComments}
        noticiaId={articulo.id}
        noticiaTitle={articulo.titulo}
      />
    </main>
  );
};

export default NoticiaPage;
