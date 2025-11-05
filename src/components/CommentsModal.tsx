import React, { useState, useEffect, useContext, useCallback } from 'react';
import { X, Send, User, AlertCircle, Trash2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { commentsService, type Comment } from '../services/comments';
import { useAlert } from '../hooks/useAlert';
import './CommentsModal.css';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticiaId: number;
  noticiaTitle: string;
  onCommentCountChange?: (noticiaId: number, count: number) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  noticiaId,
  noticiaTitle,
  onCommentCountChange
}) => {
  const { user } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedComments = await commentsService.getComments(noticiaId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Error al cargar los comentarios. Intenta de nuevo.');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [noticiaId]);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && noticiaId) {
      loadComments();
    }
  }, [isOpen, noticiaId, loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newCommentData = await commentsService.addComment(
        noticiaId,
        newComment,
        parseInt(user.id)
      );

      setComments(prev => {
        const newComments = [newCommentData, ...prev];
        onCommentCountChange?.(noticiaId, newComments.length);
        return newComments;
      });
      setNewComment('');
      showAlert('Comentario agregado exitosamente', 'success');
    } catch (error: unknown) {
      console.error('Error adding comment:', error);
      if (error instanceof Error) {
        setError(error.message || 'Error al agregar el comentario. Intenta de nuevo.');
      } else {
        setError('Ocurrió un error desconocido al agregar el comentario.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user || deletingCommentId) return;

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este comentario?');
    if (!confirmDelete) return;

    setDeletingCommentId(commentId);
    try {
      await commentsService.deleteComment(commentId, parseInt(user.id));
      setComments(prev => {
        const newComments = prev.filter(comment => comment.id !== commentId);
        onCommentCountChange?.(noticiaId, newComments.length);
        return newComments;
      });
      showAlert('Comentario eliminado exitosamente', 'success');
    } catch (error: unknown) {
      console.error('Error deleting comment:', error);
      if (error instanceof Error) {
        setError(error.message || 'Error al eliminar el comentario.');
      } else {
        setError('Ocurrió un error desconocido al eliminar el comentario.');
      }
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleClose = () => {
    setNewComment('');
    setError(null);
    onClose();
  };

  const isMyComment = (commentUserId?: number) => {
    return user && commentUserId && commentUserId.toString() === user.id;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">
            Comentarios - {noticiaTitle}
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido del modal */}
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Cargando comentarios...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <User size={48} />
              <p>No hay comentarios aún.</p>
              <span>¡Sé el primero en comentar!</span>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      {comment.userPhoto ? (
                        <img
                          src={`http://localhost:8000/uploads/${comment.userPhoto}`}
                          alt={comment.author}
                          className="comment-avatar"
                        />
                      ) : (
                        <div className="comment-avatar-placeholder">
                          <User size={16} />
                        </div>
                      )}
                      <div className="comment-author-details">
                        <span className="comment-author">{comment.author}</span>
                        {isMyComment(comment.userId) && (
                          <span className="comment-badge">Tú</span>
                        )}
                      </div>
                    </div>
                    <div className="comment-actions">
                      <span className="comment-date">{comment.date}</span>
                      {isMyComment(comment.userId) && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          title="Eliminar comentario"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para nuevo comentario */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="comment-input-container">
              {user.foto ? (
                <img
                  src={`http://localhost:8000/uploads/${user.foto}`}
                  alt={user.nombre}
                  className="comment-form-avatar"
                />
              ) : (
                <div className="comment-form-avatar-placeholder">
                  <User size={20} />
                </div>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="comment-input"
                disabled={isSubmitting}
                maxLength={500}
              />
              <button
                type="submit"
                className="comment-send-btn"
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="comment-form-footer">
              <span className="comment-counter">
                {newComment.length}/500 caracteres
              </span>
              {isSubmitting && (
                <span className="comment-submitting">
                  Publicando...
                </span>
              )}
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <User size={24} />
            <p>Debes iniciar sesión para comentar</p>
            <button
              className="login-prompt-btn"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
