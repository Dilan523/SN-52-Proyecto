import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Noticia } from '../services/noticias';
import { toggleLikeNoticia, toggleSaveNoticia, shareNoticia } from '../services/noticias';
import CommentsModal from './CommentsModal';

interface ArticleCardProps {
  noticia: Noticia;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ noticia }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toggleLikeNoticia(noticia.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toggleSaveNoticia(noticia.id);
  };

  const handleShare = () => {
    shareNoticia(noticia);
  };

  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
  };

  return (
    <>
      <article className="news-card">
        {noticia.imagen && (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="news-image"
          />
        )}
        <div className="news-content">
          <span className="news-category">{noticia.categoria.toUpperCase()}</span>
          <h3 className="news-title">{noticia.titulo}</h3>
          <p className="news-summary">
            {noticia.contenidoTexto.length > 150
              ? noticia.contenidoTexto.substring(0, 150) + '...'
              : noticia.contenidoTexto}
          </p>
          <div className="news-meta">
            <span className="news-author">{noticia.autor}</span>
            <span className="news-date">{new Date(noticia.fecha).toLocaleDateString('es-ES')}</span>
          </div>
          {noticia.etiquetas.length > 0 && (
            <div className="news-tags">
              {noticia.etiquetas.map((tag, index) => (
                <span key={index} className="news-tag">#{tag}</span>
              ))}
            </div>
          )}
          <div className="news-actions">
            <button
              onClick={handleLike}
              className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
            >
              <Heart size={16} />
              <span>{noticia.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button
              onClick={handleOpenComments}
              className="action-btn comment-btn"
            >
              <MessageCircle size={16} />
              <span>{noticia.comentarios}</span>
            </button>
            <button
              onClick={handleShare}
              className="action-btn share-btn"
            >
              <Share2 size={16} />
              <span>{noticia.compartidos}</span>
            </button>
            <button
              onClick={handleSave}
              className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
            >
              <Bookmark size={16} />
            </button>
          </div>
        </div>
      </article>

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={handleCloseComments}
        noticiaId={noticia.id}
        noticiaTitle={noticia.titulo}
      />
    </>
  );
};

export default ArticleCard;
