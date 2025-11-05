import React, { useState, useContext, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Share2, Bookmark, BookOpen, Music, Film, Landmark, ChevronDown, Theater, Zap } from 'lucide-react';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import CarouselComponent from '../../components/CarouselComponent';
import './Cultura.css';
import CommentsModal from '../../components/CommentsModal';
import Footer from '../../components/Footer';
import { UserContext } from '../../context/UserContext';
import { getNoticiasPorCategoriaPrincipal, toggleLikeNoticia, toggleSaveNoticia, shareNoticia, type Noticia } from '../../services/noticias';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';


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

interface CultureCategory {
  id: number;
  title: string;
  image: string;
  description: string;
  icon: string;
}

export default function Cultura() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<NewsItem | null>(null);
  const [noticiasCreadas, setNoticiasCreadas] = useState<Noticia[]>([]);
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; title: string; content: string } | null>(null);

  // Cargar noticias creadas al montar el componente
  useEffect(() => {
    const cargarNoticias = () => {
      const noticias = getNoticiasPorCategoriaPrincipal('cultura');
      setNoticiasCreadas(noticias);
    };

    cargarNoticias();

    // Recargar noticias cuando cambie el localStorage
    const handleStorageChange = () => {
      cargarNoticias();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const cultureCategories: CultureCategory[] = [
    {
      id: 1,
      title: 'Literatura',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop',
      description: 'Sumérgete en mundos imaginarios y reflexiones profundas a través de la palabra escrita. Un viaje por las grandes obras de la literatura universal, la poesía y el ensayo contemporáneo.',
      icon: '📚',
    },
    {
      id: 2,
      title: 'Música',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      description: 'Explora el poder de la música en la cultura. Desde géneros tradicionales hasta las tendencias modernas, descubre cómo la música une y expresa emociones.',
      icon: '🎵',
    },
    {
      id: 3,
      title: 'Cine',
      image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&h=600&fit=crop',
      description: 'Descubre la magia del séptimo arte. Analizamos películas de culto, directores icónicos y el impacto del cine en la cultura popular.',
      icon: '🎬',
    },
    {
      id: 4,
      title: 'Tradiciones',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
      description: 'Conoce las tradiciones y costumbres que definen nuestra identidad cultural. Festivales, rituales y prácticas que unen comunidades.',
      icon: '🎭',
    },
    {
      id: 5,
      title: 'Teatro',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
      description: 'Descubre el arte escénico y la expresión dramática. Desde obras clásicas hasta producciones modernas, explora el mundo del teatro y sus influencias culturales.',
      icon: '🎭',
    },
    {
      id: 6,
      title: 'Danza',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
      description: 'Sumérgete en el lenguaje universal del movimiento. Explora diferentes estilos de danza, desde tradicionales hasta contemporáneos, y su impacto en la cultura.',
      icon: '💃',
    },
  ];

  const [news, setNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: "La literatura como herramienta de cambio social",
      excerpt: "La literatura no solo entretiene, sino que transforma sociedades y mentes...",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
      category: "LITERATURA",
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
      title: "Evolución de la música en la cultura moderna",
      excerpt: "Cómo la música ha evolucionado y sigue influyendo en nuestras vidas...",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      category: "MÚSICA",
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
      title: "El cine como reflejo de la sociedad",
      excerpt: "Análisis de cómo las películas capturan y critican aspectos sociales...",
      image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=300&fit=crop",
      category: "CINE",
      likes: 28,
      comments: 15,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Buen análisis.", author: "Usuario4" }
      ]
    },
    {
      id: 4,
      title: "Preservación de tradiciones culturales",
      excerpt: "Importancia de mantener vivas nuestras raíces culturales...",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
      category: "TRADICIONES",
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
      title: "Festival Internacional de Literatura",
      image:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=500&fit=crop",
      category: "LITERATURA",
    },
    {
      id: 2,
      title: "Concierto de Música Tradicional",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop",
      category: "MÚSICA",
    },
    {
      id: 3,
      title: "Premios de Cine Nacional",
      image:
        "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&h=500&fit=crop",
      category: "CINE",
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
    setShowCommentsModal(true);
  };

  const handleCommentCountChange = (noticiaId: number, count: number) => {
    setCommentCounts(prev => ({
      ...prev,
      [noticiaId]: count
    }));
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
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedNoticia(null);
  };



  const handleCategoryClick = (categoryId: number) => {
    // Ideas para cada categoría:
    // 1. Literatura: Mostrar libros destacados, autores, reseñas
    // 2. Música: Playlists, artistas, géneros
    // 3. Cine: Películas, directores, críticas
    // 4. Tradiciones: Eventos culturales, festivales, costumbres
    // 5. Teatro: Obras, compañías, críticas
    // 6. Danza: Estilos, compañías, performances
    switch (categoryId) {
      case 1:
        // Literatura: Mostrar modal con libros destacados
        setSelectedCategory({ id: 1, title: 'Literatura', content: 'Libros destacados, autores y reseñas literarias...' });
        setShowCategoryModal(true);
        break;
      case 2:
        // Música: Mostrar modal con playlists y artistas
        setSelectedCategory({ id: 2, title: 'Música', content: 'Playlists, artistas y géneros musicales...' });
        setShowCategoryModal(true);
        break;
      case 3:
        // Cine: Mostrar modal con películas y directores
        setSelectedCategory({ id: 3, title: 'Cine', content: 'Películas, directores y críticas cinematográficas...' });
        setShowCategoryModal(true);
        break;
      case 4:
        // Tradiciones: Mostrar modal con eventos culturales
        setSelectedCategory({ id: 4, title: 'Tradiciones', content: 'Eventos culturales, festivales y costumbres tradicionales...' });
        setShowCategoryModal(true);
        break;
      case 5:
        // Teatro: Mostrar modal con obras y compañías
        setSelectedCategory({ id: 5, title: 'Teatro', content: 'Obras clásicas y modernas, compañías teatrales y críticas...' });
        setShowCategoryModal(true);
        break;
      case 6:
        // Danza: Mostrar modal con estilos y compañías
        setSelectedCategory({ id: 6, title: 'Danza', content: 'Estilos de danza tradicionales y contemporáneos, compañías y performances...' });
        setShowCategoryModal(true);
        break;
      default:
        break;
    }
  };

  const filteredNews = news;

  return (
    <div className="cultura-page">
      <div className="cultura-container">

        <CarouselComponent items={artesDestacadas} />

        <h2 className="cultura-title">Eventos</h2>

          <Accordion type="single" collapsible className="cultura-gallery-accordion">
            {cultureCategories.map((categoria) => (
              <AccordionItem key={categoria.id} value={`item-${categoria.id}`} className="cultura-card-item">
                <AccordionTrigger className="cultura-card-content">
                  <div className="cultura-card-image-wrapper">
                    <img src={categoria.image} alt={categoria.title} className="cultura-card-image" />
                    <div className="cultura-card-overlay" />
                  </div>
                  <div className="cultura-card-title-wrapper">
                    <div className="cultura-card-icon">
                      {categoria.id === 1 && <BookOpen size={20} />}
                      {categoria.id === 2 && <Music size={20} />}
                      {categoria.id === 3 && <Film size={20} />}
                      {categoria.id === 4 && <Landmark size={20} />}
                      {categoria.id === 5 && <Theater size={20} />}
                      {categoria.id === 6 && <Zap size={20} />}
                    </div>
                    <h3 className="cultura-card-title">{categoria.title}</h3>
                  </div>
                  <ChevronDown size={24} className="cultura-card-chevron" />
                </AccordionTrigger>
                <AccordionContent className="cultura-card-details">
                  <p>{categoria.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button type="primary" className="category-btn" onClick={() => handleCategoryClick(categoria.id)}>
                      Ver más
                    </Button>
                    <Button type="link" onClick={() => handleCategoryClick(categoria.id)}>
                      Explorar {categoria.title}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

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

        {selectedNoticia && (
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={handleCloseComments}
            noticiaId={selectedNoticia.id}
            noticiaTitle={selectedNoticia.title}
          />
        )}

        {selectedCategory && (
          <div className="category-modal" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: showCategoryModal ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2>{selectedCategory.title}</h2>
              <p>{selectedCategory.content}</p>
              <Button onClick={() => setShowCategoryModal(false)}>Cerrar</Button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
