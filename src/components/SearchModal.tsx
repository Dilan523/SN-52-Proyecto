import React, { useMemo, useState, useEffect } from 'react';
import type { Noticia } from '../services/noticias';
import './SearchModal.css';
import { Link } from 'react-router-dom';
import { Star, Calendar, X } from 'lucide-react';
import axios from 'axios';

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
  const [backendResults, setBackendResults] = useState<Noticia[]>([]);

  // Fetch published noticias from backend when modal opens
  useEffect(() => {
    if (isOpen && searchTerm.trim()) {
      const fetchBackendResults = async () => {
        try {
          const catsRes = await axios.get('http://localhost:8000/categorias/');
          const categorias = (catsRes.data || []) as Array<{ id_categoria: number; nombre: string }>;
          const idToName = new Map<number, string>();
          categorias.forEach(c => idToName.set(c.id_categoria, c.nombre));

          const noticiasRes = await axios.get('http://localhost:8000/api/noticias/', { params: { estado: 3, limit: 100 } });
          type BackendNoticia = {
            id_noticia: number;
            titulo: string;
            introduccion?: string;
            contenido?: string;
            categoria_id: number;
            imagen?: string;
            fecha_creacion?: string;
          };
          const noticiasBackend = (noticiasRes.data || []) as BackendNoticia[];

          const mapped = noticiasBackend.map(n => ({
            id: n.id_noticia,
            titulo: n.titulo,
            contenido: n.contenido || '',
            contenidoTexto: n.introduccion || n.contenido || '',
            imagen: n.imagen ? (n.imagen.startsWith('http') ? n.imagen : `http://localhost:8000/${n.imagen.replace(/^\//, '')}`) : '',
            categoria: idToName.get(n.categoria_id) || String(n.categoria_id),
            fecha: n.fecha_creacion,
            etiquetas: [],
            likes: 0,
            comentarios: 0,
            compartidos: 0,
            autor: 'Redacción SN-52',
            estado: 'publicado'
          } as Noticia));
          setBackendResults(mapped);
        } catch (err) {
          console.error('Error fetching backend results for search', err);
          setBackendResults([]);
        }
      };
      fetchBackendResults();
    } else {
      setBackendResults([]);
    }
  }, [isOpen, searchTerm]);

  // Combine static results with backend results
  const allResults = useMemo(() => {
    const combined = [...results, ...backendResults];
    const seen = new Set();
    const deduped: Noticia[] = [];
    for (const n of combined) {
      const key = `${n.titulo?.toLowerCase().trim()}|${(n.categoria || '').toLowerCase().trim()}`;
      if (!seen.has(key)) { seen.add(key); deduped.push(n); }
    }
    return deduped;
  }, [results, backendResults]);

  const scored = useMemo(() => {
    const scoredList = allResults.map(r => ({ article: r, score: scoreArticle(r, searchTerm) }));
    if (sortBy === 'relevance') {
      return scoredList.sort((a, b) => b.score - a.score || new Date(b.article.fecha).getTime() - new Date(a.article.fecha).getTime());
    }
    return scoredList.sort((a, b) => new Date(b.article.fecha).getTime() - new Date(a.article.fecha).getTime());
  }, [allResults, searchTerm, sortBy]);

  if (!isOpen) return null;

  const count = allResults.length;

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
