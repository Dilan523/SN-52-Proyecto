import React, { useMemo, useState } from 'react';
import type { Noticia } from '../services/noticias';
import './SearchModal.css';
import { Link } from 'react-router-dom';
import { Star, Calendar, X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  results: Noticia[];
  searchTerm: string;
};

const scoreArticle = (a: Noticia, term: string) => {
  if (!term) return 0;
  const t = term.toLowerCase();
  let score = 0;
  if (a.titulo && a.titulo.toLowerCase().includes(t)) score += 5;
  if (a.contenidoTexto && a.contenidoTexto.toLowerCase().includes(t)) score += 3;
  if (a.categoria && a.categoria.toLowerCase().includes(t)) score += 2;
  if (a.autor && a.autor.toLowerCase().includes(t)) score += 1;
  return score;
};

const SearchModal: React.FC<Props> = ({ isOpen, onClose, results, searchTerm }) => {
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  const scored = useMemo(() => {
    const scoredList = results.map(r => ({ article: r, score: scoreArticle(r, searchTerm) }));
    if (sortBy === 'relevance') {
      return scoredList.sort((a, b) => b.score - a.score || new Date(b.article.fecha).getTime() - new Date(a.article.fecha).getTime());
    }
    return scoredList.sort((a, b) => new Date(b.article.fecha).getTime() - new Date(a.article.fecha).getTime());
  }, [results, searchTerm, sortBy]);

  if (!isOpen) return null;

  const count = results.length;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <button className="search-close" onClick={onClose} aria-label="Cerrar búsqueda"><X size={18} /></button>
        <div className="search-modal-header">
          <div>
            <h3>Resultados de la Búsqueda</h3>
            <p className="search-subtitle">Mostrando {count} {count === 1 ? 'resultado' : 'resultados'}{searchTerm ? ` para "${searchTerm}"` : ''}</p>
          </div>

          <div className="search-modal-controls">
            <span className="orden-label">Ordenar por:</span>
            <button className={`control-btn ${sortBy === 'relevance' ? 'active' : ''}`} onClick={() => setSortBy('relevance')}>
              <Star size={14} />
              <span>Relevancia</span>
            </button>
            <button className={`control-btn ${sortBy === 'date' ? 'active' : ''}`} onClick={() => setSortBy('date')}>
              <Calendar size={14} />
              <span>Fecha</span>
            </button>
          </div>
        </div>

        <div className="search-modal-body">
          {scored.length === 0 && <p className="no-results">No se encontraron resultados para "{searchTerm}"</p>}

          {scored.map(({ article }) => (
            <div key={article.id} className="search-result">
              <div className="sr-left">
                {article.imagen ? <img src={article.imagen} alt={article.titulo} /> : <div className="sr-placeholder" />}
              </div>

              <div className="sr-mid">
                <div className="sr-meta">
                  <span className="sr-category">{article.categoria}</span>
                  <span className="sr-date">{new Date(article.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <h4 className="sr-title">{article.titulo}</h4>
                <p className="sr-snippet">{article.contenidoTexto ? (article.contenidoTexto.length > 180 ? article.contenidoTexto.substring(0, 180) + '...' : article.contenidoTexto) : ''}</p>
              </div>

              <div className="sr-right">
                <Link className="sr-view" to={`/noticia/${article.id}`} state={{ article }}>Leer</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
