import React, { useState, useEffect } from "react";// Importaciones necesarias para el componente React
import { Heart, MessageCircle, Share2, Bookmark, Search } from "lucide-react";// Importación de iconos de Lucide para botones de acciones
import { Carousel } from 'antd';// Importación del componente Carousel de Ant Design para el carrusel
import { getNoticiasCreadas, toggleLikeNoticia, toggleSaveNoticia, shareNoticia, getNoticiasPorCategoriaPrincipal } from "../../services/noticias";
import type { Noticia } from "../../services/noticias";
import SearchModal from "../../components/SearchModal";
import getAllArticles from "../../data/allArticles";
import { featuredNewsHome, noticiasRelevantes } from "../../data/staticNoticias";
import "./home.css";// Importación del archivo de estilos CSS
// Importación de imágenes decorativas para el footer
import CommentsModal from "../../components/CommentsModal";
import Footer from "../../components/Footer";

// Array de objetos que contiene las imágenes destacadas para mostrar en la barra lateral
const imagenesDestacadas = [
  {
    urlImagen: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Análisis de datos',
    texto: 'Análisis de tendencias tecnológicas',
    categoria: 'TECNOLOGÍA',
    fecha: 'hace 1 día'
  },
  {
    urlImagen: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Estudiante',
    texto: 'Formación en competencias digitales',
    categoria: 'EDUCACIÓN',
    fecha: 'hace 2 días'
  },
  {
    urlImagen: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Trabajo en equipo',
    texto: 'Proyectos colaborativos exitosos',
    categoria: 'CULTURA',
    fecha: 'hace 3 días'
  },
  {
    urlImagen: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Innovación',
    texto: 'Nuevas metodologías de enseñanza',
    categoria: 'INNOVACIÓN',
    fecha: 'hace 4 días'
  },
  {
    urlImagen: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Laboratorio',
    texto: 'Laboratorios de última tecnología',
    categoria: 'CIENCIA',
    fecha: 'hace 5 días'
  }
];

const iconosRedes = {
  facebook: "https://cdn-icons-png.flaticon.com/512/124/124010.png",
  instagram: "https://cdn-icons-png.flaticon.com/512/174/174855.png",
  x: "https://cdn-icons-png.flaticon.com/512/124/124021.png",
  youtube: "https://cdn-icons-png.flaticon.com/512/174/174883.png",
};

// Usamos `featuredNewsHome` y `noticiasRelevantes` importados desde `src/data/staticNoticias`

// Definición del componente funcional Inicio usando React.FC
export const Inicio: React.FC = () => {
  // Estados para manejar artículos marcados como me gusta, guardados y término de búsqueda
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [allArticles, setAllArticles] = useState<Noticia[]>([]);
  const [searchResults, setSearchResults] = useState<Noticia[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<any>(null);
  const [noticiasCreadas, setNoticiasCreadas] = useState<Noticia[]>([]);
  const [noticiasDeportes, setNoticiasDeportes] = useState<Noticia[]>([]);
  const [noticiasArte, setNoticiasArte] = useState<Noticia[]>([]);
  const [noticiasCultura, setNoticiasCultura] = useState<Noticia[]>([]);
  const [noticiasBienestar, setNoticiasBienestar] = useState<Noticia[]>([]);
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});

  // Cargar noticias creadas al montar el componente
  useEffect(() => {
    const cargarNoticias = () => {
      const noticias = getNoticiasCreadas();
      setNoticiasCreadas(noticias);

      // Filtrar por categorías principales
      setNoticiasDeportes(getNoticiasPorCategoriaPrincipal('deportes'));
      setNoticiasArte(getNoticiasPorCategoriaPrincipal('arte'));
      setNoticiasCultura(getNoticiasPorCategoriaPrincipal('cultura'));
      setNoticiasBienestar(getNoticiasPorCategoriaPrincipal('bienestar'));
    };

  // Cargar todas las noticias centralizadas (estáticas + creadas)
  const all = getAllArticles();
  setAllArticles(all);

    cargarNoticias();

    // Recargar noticias cuando cambie el localStorage (útil para desarrollo)
    const handleStorageChange = () => {
      cargarNoticias();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      setShowSearchModal(false);
      return;
    }

    const handler = setTimeout(() => {
      const results = allArticles.filter(a => {
        const fields = [a.titulo || '', a.contenidoTexto || '', a.categoria || '', a.contenido || ''];
        return fields.some(f => f.toLowerCase().includes(term));
      });

      setSearchResults(results);
      setShowSearchModal(true);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, allArticles]);

  // Función para manejar el like de un artículo
  const handleLike = (articleId: number) => {
    toggleLikeNoticia(articleId);
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Función para manejar el guardado de un artículo
  const handleSave = (articleId: number) => {
    toggleSaveNoticia(articleId);
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Función para manejar el compartir de un artículo
  const handleShare = (article: any) => {
    shareNoticia(article);
  };

  // Función para abrir el modal de comentarios
  const handleOpenComments = (noticia: any) => {
    setSelectedNoticia(noticia);
    setShowCommentsModal(true);
  };

  // Función para cerrar el modal de comentarios
  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedNoticia(null);
  };

  // Función para manejar cambios en el conteo de comentarios
  const handleCommentCountChange = (noticiaId: number, count: number) => {
    setCommentCounts(prev => ({
      ...prev,
      [noticiaId]: count
    }));
  };

  // Renderizado del componente con estructura JSX
  return (
    // Contenedor principal de la página de inicio
    <div className="container home-page">
      {/* Contenedor principal con layout de grid */}
      <div className="main-container">
        {/* Barra lateral izquierda con widgets */}
        <aside className="sidebar-left">
          {/* Search */}
          <div className="sidebar-section">
            <h3>Buscador</h3>
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                className="sidebar-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* (antes había un panel estático aquí) */}
          </div>

          {/* Articulo destacado */}
          <div className="sidebar-section">
            <h3>Articulo Destacado</h3>
            <div className="featured-preview">
              <img
                src="https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Featured Article"
              />
              <div className="featured-actions">
                <button className="featured-btn like-btn">
                  <Heart size={16} />
                  Me gustó
                </button>
                <button className="featured-btn share-btn">
                  <Share2 size={16} />
                  Compartir
                </button>
              </div>
            </div>
          </div>

          {/* Areas del Sena */}
          <div className="sidebar-section">
            <h3>Areas</h3>
            <div className="highlights-grid">
              {imagenesDestacadas.slice(0, 5).map((item, index) => (
                <div key={index} className="highlight-circle">
                  <img src={item.urlImagen} alt={item.alt} />
                  <span className="highlight-label">{item.categoria}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="sidebar-section">
            <h3>Boletin Informatico</h3>
            <div className="newsletter-content">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Newsletter"
              />
              <div className="newsletter-actions">
                <button className="featured-btn like-btn">
                  <Heart size={16} />
                  Me gustó
                </button>
                <button className="featured-btn share-btn">
                  <Share2 size={16} />
                  Compartir
                </button>
              </div>
            </div>
          </div>

          {/* Etiquetas de populares de las noticias */}
          <div className="sidebar-section">
            <h3>Etiquetas Populares</h3>
            <div className="tags-container">
              <span className="tag">No hay etiquetas aún.</span>
            </div>
          </div>

          {/* REdes sociales */}
          <div className="sidebar-section">
            <h3>Redes</h3>
            <div className="networks-tags">
              <span className="network-tag">Instagram</span>
              <span className="network-tag">Tik-Tok</span>
              <span className="network-tag">Twitter</span>
              <span className="network-tag">Facebook</span>
            </div>
          </div>
        </aside>

        {/* Contenido principal con carrusel y secciones */}
        <main className="main-content">
          {/* Sección de carrusel destacado */}
          <section className="featured-section">
            <Carousel autoplay>
              {featuredNewsHome.map((item) => (
                <div key={item.id} className="featured-card">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="featured-image"
                  />
                  <div className="featured-overlay" />
                  <div className="featured-content">
                     <span className="featured-category">{item.category}</span>
                     <h2 className="featured-title">{item.title}</h2>
                  </div>
                </div>
              ))}
            </Carousel>
          </section>
          {/* Secciones principales de contenido */}
          <div className="main-sections">
            {/* Sports Section */}
            <section className="content-section">
              <h2>DEPORTES</h2>
              <div className="section-content">
                {noticiasDeportes.length > 0 ? (
                  <div className="news-grid">
                    {noticiasDeportes.slice(0, 3).map((noticia) => (
                      <article key={noticia.id} className="news-card">
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="news-image"
                        />
                        <div className="news-content">
                          <span className="news-category">{noticia.categoria}</span>
                          <h3 className="news-title">{noticia.titulo}</h3>
                          <p className="news-summary">{noticia.contenidoTexto}</p>
                          <div className="news-meta">
                            <span className="news-author">{noticia.autor}</span>
                            <span className="news-date">{noticia.fecha}</span>
                          </div>
                          <div className="news-actions">
                            <button
                              onClick={() => handleLike(noticia.id)}
                              className={`action-btn like-btn ${likedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Heart size={16} />
                              <span>{noticia.likes + (likedArticles.has(noticia.id) ? 1 : 0)}</span>
                            </button>
                            <button
                              onClick={() => handleOpenComments(noticia)}
                              className="action-btn comment-btn"
                            >
                              <MessageCircle size={16} />
                              <span>{commentCounts[noticia.id] ?? noticia.comentarios}</span>
                            </button>
                            <button
                              onClick={() => handleShare(noticia)}
                              className="action-btn share-btn"
                            >
                              <Share2 size={16} />
                              <span>{noticia.compartidos}</span>
                            </button>
                            <button
                              onClick={() => handleSave(noticia.id)}
                              className={`action-btn save-btn ${savedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Data comment contains actual impacts for society, beneficial parameters and exemplary that requires...</p>
                )}
              </div>
            </section>

            {/* Arts Section */}
            <section className="content-section">
              <h2>ARTE</h2>
              <div className="section-content">
                {noticiasArte.length > 0 ? (
                  <div className="news-grid">
                    {noticiasArte.slice(0, 3).map((noticia) => (
                      <article key={noticia.id} className="news-card">
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="news-image"
                        />
                        <div className="news-content">
                          <span className="news-category">{noticia.categoria}</span>
                          <h3 className="news-title">{noticia.titulo}</h3>
                          <p className="news-summary">{noticia.contenidoTexto}</p>
                          <div className="news-meta">
                            <span className="news-author">{noticia.autor}</span>
                            <span className="news-date">{noticia.fecha}</span>
                          </div>
                          <div className="news-actions">
                            <button
                              onClick={() => handleLike(noticia.id)}
                              className={`action-btn like-btn ${likedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Heart size={16} />
                              <span>{noticia.likes + (likedArticles.has(noticia.id) ? 1 : 0)}</span>
                            </button>
                            <button
                              onClick={() => handleOpenComments(noticia)}
                              className="action-btn comment-btn"
                            >
                              <MessageCircle size={16} />
                              <span>{commentCounts[noticia.id] ?? noticia.comentarios}</span>
                            </button>
                            <button
                              onClick={() => handleShare(noticia)}
                              className="action-btn share-btn"
                            >
                              <Share2 size={16} />
                              <span>{noticia.compartidos}</span>
                            </button>
                            <button
                              onClick={() => handleSave(noticia.id)}
                              className={`action-btn save-btn ${savedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Data comment contains actual impacts for society, beneficial parameters and exemplary that requires...</p>
                )}
              </div>
            </section>

            {/* Culture Section */}
            <section className="content-section">
              <h2>CULTURA</h2>
              <div className="section-content">
                {noticiasCultura.length > 0 ? (
                  <div className="news-grid">
                    {noticiasCultura.slice(0, 3).map((noticia) => (
                      <article key={noticia.id} className="news-card">
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="news-image"
                        />
                        <div className="news-content">
                          <span className="news-category">{noticia.categoria}</span>
                          <h3 className="news-title">{noticia.titulo}</h3>
                          <p className="news-summary">{noticia.contenidoTexto}</p>
                          <div className="news-meta">
                            <span className="news-author">{noticia.autor}</span>
                            <span className="news-date">{noticia.fecha}</span>
                          </div>
                          <div className="news-actions">
                            <button
                              onClick={() => handleLike(noticia.id)}
                              className={`action-btn like-btn ${likedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Heart size={16} />
                              <span>{noticia.likes + (likedArticles.has(noticia.id) ? 1 : 0)}</span>
                            </button>
                            <button
                              onClick={() => handleOpenComments(noticia)}
                              className="action-btn comment-btn"
                            >
                              <MessageCircle size={16} />
                              <span>{commentCounts[noticia.id] ?? noticia.comentarios}</span>
                            </button>
                            <button
                              onClick={() => handleShare(noticia)}
                              className="action-btn share-btn"
                            >
                              <Share2 size={16} />
                              <span>{noticia.compartidos}</span>
                            </button>
                            <button
                              onClick={() => handleSave(noticia.id)}
                              className={`action-btn save-btn ${savedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Data comment contains actual impacts for society, beneficial parameters and exemplary that requires...</p>
                )}
              </div>
            </section>

            {/* Wellness Section */}
            <section className="content-section">
              <h2>BIENESTAR</h2>
              <div className="section-content">
                {noticiasBienestar.length > 0 ? (
                  <div className="news-grid">
                    {noticiasBienestar.slice(0, 3).map((noticia) => (
                      <article key={noticia.id} className="news-card">
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="news-image"
                        />
                        <div className="news-content">
                          <span className="news-category">{noticia.categoria}</span>
                          <h3 className="news-title">{noticia.titulo}</h3>
                          <p className="news-summary">{noticia.contenidoTexto}</p>
                          <div className="news-meta">
                            <span className="news-author">{noticia.autor}</span>
                            <span className="news-date">{noticia.fecha}</span>
                          </div>
                          <div className="news-actions">
                            <button
                              onClick={() => handleLike(noticia.id)}
                              className={`action-btn like-btn ${likedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Heart size={16} />
                              <span>{noticia.likes + (likedArticles.has(noticia.id) ? 1 : 0)}</span>
                            </button>
                            <button
                              onClick={() => handleOpenComments(noticia)}
                              className="action-btn comment-btn"
                            >
                              <MessageCircle size={16} />
                              <span>{commentCounts[noticia.id] ?? noticia.comentarios}</span>
                            </button>
                            <button
                              onClick={() => handleShare(noticia)}
                              className="action-btn share-btn"
                            >
                              <Share2 size={16} />
                              <span>{noticia.compartidos}</span>
                            </button>
                            <button
                              onClick={() => handleSave(noticia.id)}
                              className={`action-btn save-btn ${savedArticles.has(noticia.id) ? 'active' : ''}`}
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Data comment contains actual impacts for society, beneficial parameters and exemplary that requires...</p>
                )}
              </div>
            </section>

            {/* Sección de noticias principales */}
            <section className="news-section">
              <h2>Noticias Relevantes</h2>
              {/* Grid de tarjetas de noticias */}
              <div className="news-grid">
                {/* Solo mostrar noticias hardcodeadas */}
                {noticiasRelevantes.map((noticia) => (
                  <article key={noticia.id} className="news-card">
                    <img
                      src={noticia.imagen}
                      alt={noticia.titulo}
                      className="news-image"
                    />
                    <div className="news-content">
                      <span className="news-category">{noticia.categoria}</span>
                      <h3 className="news-title">{noticia.titulo}</h3>
                      <p className="news-summary">{(noticia as any).resumen || (noticia as any).contenidoTexto}</p>
                      <div className="news-meta">
                        <span className="news-author">{noticia.autor}</span>
                        <span className="news-date">{noticia.fecha}</span>
                      </div>
                      {/* Botones de interacción con la noticia */}
                      <div className="news-actions">
                        <button
                          onClick={() => handleLike(noticia.id)}
                          className={`action-btn like-btn ${likedArticles.has(noticia.id) ? 'active' : ''}`}
                        >
                          <Heart size={16} />
                          <span>{noticia.likes + (likedArticles.has(noticia.id) ? 1 : 0)}</span>
                        </button>
                        <button
                          onClick={() => handleOpenComments(noticia)}
                          className="action-btn comment-btn"
                        >
                          <MessageCircle size={16} />
                          <span>{commentCounts[noticia.id] ?? noticia.comentarios}</span>
                        </button>
                        <button
                          onClick={() => handleShare(noticia)}
                          className="action-btn share-btn"
                        >
                          <Share2 size={16} />
                          <span>{noticia.compartidos}</span>
                        </button>
                        <button
                          onClick={() => handleSave(noticia.id)}
                          className={`action-btn save-btn ${savedArticles.has(noticia.id) ? 'active' : ''}`}
                        >
                          <Bookmark size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Barra lateral derecha con widgets adicionales */}
        <aside className="sidebar-right">
          {/* Últimas noticias */}
          <div className="sidebar-section">
            <h3>Ultimas Noticias</h3>
            <div className="latest-news">
              {imagenesDestacadas.map((item, index) => (
                <div key={index} className="latest-item">
                  <img src={item.urlImagen} alt={item.alt} />
                  <div className="latest-content">
                    <span className="latest-category">{item.categoria}</span>
                    <p className="latest-text">{item.texto}</p>
                    <span className="latest-date">{item.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premios y reconocimientos */}
          <div className="sidebar-section">
            <h3>Premios</h3>
            <div className="awards-list">
              <div className="award-item">La Red de Internet</div>
              <div className="award-item">Diversidad Personalizada</div>
              <div className="award-item">Desarrollos Climáticos NY</div>
            </div>
          </div>

          {/* Mensaje motivacional */}
          <div className="sidebar-section weekend-section">
            <div className="weekend-content">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Weekend"
              />
              <div className="weekend-text">
                <h3>VAS A LOGRAR GRANDES COSAS</h3>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de búsqueda (resultados en tiempo real) */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        results={searchResults}
        searchTerm={searchTerm}
      />

      {/* Modal de comentarios */}
      {selectedNoticia && (
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={handleCloseComments}
          noticiaId={selectedNoticia.id}
          noticiaTitle={selectedNoticia.titulo}
          onCommentCountChange={handleCommentCountChange}
        />
      )}

      <Footer />
    </div>
  );
};

export default Inicio;

// Insertar modal de búsqueda dentro del componente:
