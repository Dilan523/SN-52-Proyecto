import React, { useState, useContext, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import CarouselComponent from '../../components/CarouselComponent';
import './artes.css';
import CommentsModal from '../../components/CommentsModal';
import Footer from '../../components/Footer';
import { UserContext } from '../../context/UserContext';
import { getNoticiasPorCategoriaPrincipal, toggleLikeNoticia, toggleSaveNoticia, shareNoticia, type Noticia } from '../../services/noticias';
import axios from 'axios';

// Helper: load published noticias from backend and map categoria_id -> nombre
const fetchPublishedNoticiasByPrincipal = async (principal: string) => {
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

    return noticiasBackend.map(n => ({
      id: n.id_noticia,
      titulo: n.titulo,
      contenidoTexto: n.introduccion || n.contenido || '',
      imagen: n.imagen ? (n.imagen.startsWith('http') ? n.imagen : `http://localhost:8000/${n.imagen.replace(/^\//, '')}`) : '',
      categoria: idToName.get(n.categoria_id) || String(n.categoria_id),
      fecha: n.fecha_creacion,
      etiquetas: [],
      likes: 0,
      comentarios: 0
    })).filter(nb => {
      const lower = (nb.categoria || '').toLowerCase();
      if (['salud','entrenamiento','nutrición','recuperación','fútbol','atletismo','tecnología'].includes(lower)) return principal === 'deportes';
      if (['literatura','música','cine','tradiciones'].includes(lower)) return principal === 'cultura';
      if (['pintura','teatro','fotografía','música'].includes(lower)) return principal === 'arte';
      if (lower === 'bienestar') return principal === 'bienestar';
      return lower === principal;
    });
  } catch (err) {
    console.error('Error fetching backend noticias', err);
    return [];
  }
};

interface Comment {
  id: number;
  text: string;
  author: string;
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsList: Comment[];
}

interface ArteDestacado {
  id: number;
  title: string;
  image: string;
  category: string;
}

export default function Artes() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<NewsItem | null>(null);
  const [noticiasCreadas, setNoticiasCreadas] = useState<Noticia[]>([]);
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});
  const [likedArtTechniques, setLikedArtTechniques] = useState<Set<number>>(new Set());
  const [savedArtTechniques, setSavedArtTechniques] = useState<Set<number>>(new Set());
  const [artTechniques, setArtTechniques] = useState([
    {
      id: 1,
      title: "Cine",
      excerpt: "Descubre el séptimo arte: historias que cobran vida en la pantalla grande.",
      image: "https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c?w=500&h=300&fit=crop",
      category: "CINE",
      likes: 45,
      comments: 12,
      isLiked: false,
      isSaved: false,
      commentsList: []
    },
    {
      id: 2,
      title: "Literatura",
      excerpt: "Sumérgete en mundos imaginarios a través de las palabras de grandes autores.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop",
      category: "LITERATURA",
      likes: 38,
      comments: 9,
      isLiked: false,
      isSaved: false,
      commentsList: []
    },
    {
      id: 3,
      title: "Tradiciones",
      excerpt: "Celebra las costumbres y rituales que unen a nuestras comunidades.",
      image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=500&h=300&fit=crop",
      category: "TRADICIONES",
      likes: 52,
      comments: 15,
      isLiked: false,
      isSaved: false,
      commentsList: []
    },
    {
      id: 4,
      title: "Música",
      excerpt: "Siente el ritmo del alma: melodías que conectan emociones y culturas.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
      category: "MÚSICA",
      likes: 67,
      comments: 21,
      isLiked: false,
      isSaved: false,
      commentsList: []
    }
  ]);

  // Cargar noticias creadas al montar el componente
  useEffect(() => {
    const cargarNoticias = () => {
      const noticias = getNoticiasPorCategoriaPrincipal('arte');
      setNoticiasCreadas(noticias);
    };

    cargarNoticias();

    // Also fetch published noticias from backend and merge them
    (async () => {
      const backendNoticias = await fetchPublishedNoticiasByPrincipal('arte');
      if (backendNoticias.length) {
        const mapped: Noticia[] = backendNoticias.map(b => ({
          id: b.id,
          titulo: b.titulo,
          contenido: b.contenidoTexto,
          contenidoTexto: b.contenidoTexto,
          categoria: b.categoria,
          fecha: b.fecha || '',
          imagen: b.imagen,
          etiquetas: b.etiquetas || [],
          likes: b.likes || 0,
          comentarios: b.comentarios || 0,
          compartidos: 0,
          autor: 'Redacción SN-52',
          estado: 'publicado'
        }));

        setNoticiasCreadas(prev => {
          const combined = [...mapped, ...prev];
          const seen = new Set();
          const deduped: Noticia[] = [];
          for (const n of combined) {
            const key = `${n.titulo?.toLowerCase().trim()}|${(n.categoria || '').toLowerCase().trim()}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(n);
            }
          }
          return deduped;
        });
      }
    })();

    // Recargar noticias cuando cambie el localStorage
    const handleStorageChange = () => {
      cargarNoticias();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [news, setNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: "La revolución del arte digital",
      excerpt: "Artistas fusionan tecnología y creatividad para redefinir los límites del arte.",
      image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1200&q=80",
      category: "PINTURA",
      likes: 45,
      comments: 12,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Excelente artículo!", author: "Usuario1" },
        { id: 2, text: "Muy informativo.", author: "Usuario2" }
      ]
    },
    {
      id: 2,
      title: "Teatro callejero: arte sin escenario",
      excerpt: "Las calles se convierten en escenarios vivos para obras que conectan con el público.",
      image: "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1200&q=80",
      category: "TEATRO",
      likes: 32,
      comments: 8,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Interesante!", author: "Usuario3" }
      ]
    },
    {
      id: 3,
      title: "Fotografía urbana: la ciudad como lienzo",
      excerpt: "Los fotógrafos contemporáneos encuentran belleza en el caos urbano.",
      image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=1200&q=80",
      category: "FOTOGRAFÍA",
      likes: 28,
      comments: 15,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Buen consejo.", author: "Usuario4" }
      ]
    },
    {
      id: 4,
      title: "Ritmos del alma",
      excerpt: "Nuevos sonidos y artistas emergentes redefinen la escena musical latinoamericana.",
      image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80",
      category: "MÚSICA",
      likes: 39,
      comments: 6,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Totalmente de acuerdo.", author: "Usuario5" }
      ]
    }
  ]);

  const artesDestacadas: ArteDestacado[] = [
    {
      id: 1,
      title: "La revolución del arte digital",
      image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1200&q=80",
      category: "PINTURA",
    },
    {
      id: 2,
      title: "Teatro callejero: arte sin escenario",
      image: "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1200&q=80",
      category: "TEATRO",
    },
    {
      id: 3,
      title: "Fotografía urbana: la ciudad como lienzo",
      image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=1200&q=80",
      category: "FOTOGRAFÍA",
    },
  ];

  const autores = [
    {
      id: 1,
      nombre: "Ana Ruiz",
      articulo: "El arte que respira ciudad",
      imagen: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 2,
      nombre: "Carlos Medina",
      articulo: "La nueva era de los museos",
      imagen: "https://i.pravatar.cc/100?img=5",
    },
    {
      id: 3,
      nombre: "María Gutiérrez",
      articulo: "Pintar con el alma",
      imagen: "https://i.pravatar.cc/100?img=7",
    },
    {
      id: 4,
      nombre: "Andrés Pardo",
      articulo: "Teatro y resistencia",
      imagen: "https://i.pravatar.cc/100?img=9",
    },
  ];

  // Funciones para manejar likes y saves de noticias creadas
  const handleLikeCreada = (articleId: number) => {
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

  const handleSaveCreada = (articleId: number) => {
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

  const handleShareCreada = (noticia: Noticia) => {
    shareNoticia(noticia);
  };

  const handleOpenCommentsCreada = (noticia: Noticia) => {
    setSelectedNoticia({
      id: noticia.id,
      title: noticia.titulo,
      excerpt: noticia.contenidoTexto,
      image: noticia.imagen || '',
      category: noticia.categoria,
      likes: noticia.likes,
      comments: noticia.comentarios,
      isLiked: false,
      isSaved: false,
      commentsList: []
    });
    // Ensure comment count is present in state
    setCommentCounts(prev => ({ ...prev, [noticia.id]: noticia.comentarios }));
    setShowCommentsModal(true);
  };

 

  const toggleLike = (id: number) => {
    setNews(news.map(item =>
      item.id === id
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const toggleSave = (id: number) => {
    setNews(news.map(item =>
      item.id === id
        ? { ...item, isSaved: !item.isSaved }
        : item
    ));
  };

  const handleOpenComments = (noticia: NewsItem) => {
    setSelectedNoticia(noticia);
    setCommentCounts(prev => ({ ...prev, [noticia.id]: noticia.comments }));
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedNoticia(null);
  };

  const toggleLikeArtTechnique = (id: number) => {
    setArtTechniques(artTechniques.map(item =>
      item.id === id
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const toggleSaveArtTechnique = (id: number) => {
    setArtTechniques(artTechniques.map(item =>
      item.id === id
        ? { ...item, isSaved: !item.isSaved }
        : item
    ));
  };

  const handleShareArtTechnique = (technique: { title: string; excerpt?: string }) => {
    // Simple share functionality, could be enhanced
    if (navigator.share) {
      navigator.share({
        title: technique.title,
        text: technique.excerpt,
        url: window.location.href,
      });
    } else {
      alert(`Compartir: ${technique.title}`);
    }
  };

  const filteredNews = news;

  return (
    <div className="artes-page news-body">
      <div className="news-container">
        <CarouselComponent items={artesDestacadas} />

        <section className="main-content">
            {user && user.rol === "escritor" && (
              <div className="create-news-section">
                <Button
                  type="primary"
                  icon={<Plus size={18} />}
                  onClick={() => navigate("/crearArt")}
                  className="create-news-btn"
                >
                  Crear Noticia
                </Button>
              </div>
            )}
          <div className="news-grid">
            {/* Combinar noticias hardcodeadas con las creadas dinámicamente */}
            {[...filteredNews, ...noticiasCreadas.map(noticia => ({
              id: noticia.id,
              title: noticia.titulo,
              excerpt: noticia.contenidoTexto,
              image: noticia.imagen || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
              category: noticia.categoria,
              likes: noticia.likes,
              comments: noticia.comentarios,
              isLiked: likedArticles.has(noticia.id),
              isSaved: savedArticles.has(noticia.id),
              commentsList: []
            }))].map(item => (
              <Card key={item.id} className="news-card" cover={<img src={item.image} alt={item.title} className="news-image" />}>
                <div className="news-content">
                  <div>
                    <span className="news-category">{item.category}</span>
                    <h3 className="news-item-title">{item.title}</h3>
                    <p className="news-excerpt">{item.excerpt}</p>
                    <div className="news-meta">
                      <span className="news-author">{item.id > 1000 ? 'Usuario' : 'Redacción SN-52'}</span>
                      <span className="news-date">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="news-actions">
                    <Button type="text" size="small" icon={<Heart size={18} />} onClick={() => item.id > 1000 ? handleLikeCreada(item.id) : toggleLike(item.id)} className={"action-btn " + (item.isLiked ? "like-active" : "")}>
                      {item.likes + (item.isLiked ? 1 : 0)}
                    </Button>
                    <Button type="text" size="small" icon={<MessageCircle size={18} />} onClick={() => item.id > 1000 ? handleOpenCommentsCreada(noticiasCreadas.find(n => n.id === item.id)!) : handleOpenComments(item)} className="action-btn">
                      {commentCounts[item.id] ?? item.comments}
                    </Button>
                    <Button type="text" size="small" icon={<Share2 size={18} />} onClick={() => item.id > 1000 ? handleShareCreada(noticiasCreadas.find(n => n.id === item.id)!) : null} className="action-btn" />
                    <div className="flex-grow" />
                    <Button type="text" size="small" icon={<Bookmark size={18} />} onClick={() => item.id > 1000 ? handleSaveCreada(item.id) : toggleSave(item.id)} className={"action-btn " + (item.isSaved ? "save-active" : "")} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Modal de comentarios */}
        {selectedNoticia && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={handleCloseComments}
            noticiaId={selectedNoticia.id}
            noticiaTitle={selectedNoticia.title}
          />
        )}

        {/* Barra de autores */}
        <div className="autores-bar">
          {autores.map((a) => (
            <div key={a.id} className="autor">
              <img src={a.imagen} alt={a.nombre} />
              <h4>{a.nombre}</h4>
              <p>{a.articulo}</p>
            </div>
          ))}
        </div>

        {/* EXPRESIONES CULTURALES */}
        <section className="come-saludable-section">
          <div className="come-saludable-text">
            <h1>EXPRESIONES CULTURALES</h1>
            <p>
              Sumérgete en las manifestaciones artísticas que definen nuestra identidad<br />
              La cultura es el alma de una sociedad, expresada a través de diversas formas artísticas que conectan pasado, presente y futuro.
              Desde el cine que narra historias universales hasta la música que une corazones, cada expresión cultural es una ventana al alma humana.<br /><br />
              La literatura nos transporta a mundos imaginarios, las tradiciones preservan nuestras raíces, y el cine nos hace reflexionar sobre la vida.
              Estas expresiones no solo entretienen, sino que educan, inspiran y transforman nuestra manera de ver el mundo.<br /><br />
              Explora estas manifestaciones culturales, déjate llevar por su magia y descubre cómo el arte en todas sus formas enriquece nuestra existencia.
            </p>
          </div>
          <div className="come-saludable-images">
            {artTechniques.map(item => (
              <Card
                key={item.id}
                className="news-card"
                cover={<img src={item.image} alt={item.title} className="news-image" />}
                onClick={() => {
                  // Funcionalidad al hacer click en la imagen
                  if (item.title === "Cine") {
                    // Abrir modal con información detallada del cine
                    setSelectedNoticia({
                      id: 9999 + item.id,
                      title: `Cine: ${item.title}`,
                      excerpt: "Descubre películas clásicas y modernas, reseñas de estrenos, directores influyentes y el impacto del cine en la sociedad. Explora géneros desde drama hasta ciencia ficción.",
                      image: item.image,
                      category: item.category,
                      likes: item.likes,
                      comments: item.comments,
                      isLiked: item.isLiked,
                      isSaved: item.isSaved,
                      commentsList: []
                    });
                    setShowCommentsModal(true);
                  } else if (item.title === "Literatura") {
                    // Navegar a una página de literatura o mostrar modal
                    setSelectedNoticia({
                      id: 9999 + item.id,
                      title: `Literatura: ${item.title}`,
                      excerpt: "Sumérgete en obras maestras de la literatura universal. Desde novelas clásicas hasta autores contemporáneos, descubre reseñas, análisis y recomendaciones literarias.",
                      image: item.image,
                      category: item.category,
                      likes: item.likes,
                      comments: item.comments,
                      isLiked: item.isLiked,
                      isSaved: item.isSaved,
                      commentsList: []
                    });
                    setShowCommentsModal(true);
                  } else if (item.title === "Tradiciones") {
                    // Mostrar información sobre tradiciones culturales
                    setSelectedNoticia({
                      id: 9999 + item.id,
                      title: `Tradiciones: ${item.title}`,
                      excerpt: "Conoce las costumbres y rituales que definen nuestra cultura. Festivales, ceremonias y tradiciones ancestrales que unen comunidades y preservan la historia.",
                      image: item.image,
                      category: item.category,
                      likes: item.likes,
                      comments: item.comments,
                      isLiked: item.isLiked,
                      isSaved: item.isSaved,
                      commentsList: []
                    });
                    setShowCommentsModal(true);
                  } else if (item.title === "Música") {
                    // Abrir sección de música con playlists o información
                    setSelectedNoticia({
                      id: 9999 + item.id,
                      title: `Música: ${item.title}`,
                      excerpt: "Explora géneros musicales diversos, artistas emergentes y leyendas. Desde ritmos tradicionales hasta tendencias modernas, la música que conecta almas.",
                      image: item.image,
                      category: item.category,
                      likes: item.likes,
                      comments: item.comments,
                      isLiked: item.isLiked,
                      isSaved: item.isSaved,
                      commentsList: []
                    });
                    setShowCommentsModal(true);
                  }
                }}
              >
                <div className="news-content">
                  <div className="news-actions">
                    <Button type="text" size="small" icon={<Heart size={18} />} onClick={(e) => { e.stopPropagation(); toggleLikeArtTechnique(item.id); }} className={"action-btn " + (item.isLiked ? "like-active" : "")}>
                      {item.likes}
                    </Button>
                    <Button type="text" size="small" icon={<MessageCircle size={18} />} onClick={(e) => { e.stopPropagation(); handleOpenComments({id: 9999 + item.id, title: `Expresión Cultural: ${item.title}`, excerpt: item.excerpt, image: item.image, category: item.category, likes: item.likes, comments: item.comments, isLiked: item.isLiked, isSaved: item.isSaved, commentsList: []}); }} className="action-btn">
                      {item.comments}
                    </Button>
                    <Button type="text" size="small" icon={<Share2 size={18} />} onClick={(e) => { e.stopPropagation(); handleShareArtTechnique(item); }} className="action-btn" />
                    <div className="flex-grow" />
                    <Button type="text" size="small" icon={<Bookmark size={18} />} onClick={(e) => { e.stopPropagation(); toggleSaveArtTechnique(item.id); }} className={"action-btn " + (item.isSaved ? "save-active" : "")} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}