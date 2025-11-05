import React, { useState, useContext, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import CarouselComponent from '../../components/CarouselComponent';
import './bienestar.css';
import CommentsModal from '../../components/CommentsModal';
import Footer from '../../components/Footer';
import { UserContext } from '../../context/UserContext';
import { getNoticiasPorCategoriaPrincipal, toggleLikeNoticia, toggleSaveNoticia, shareNoticia, type Noticia } from '../../services/noticias';

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

interface BienestarDestacado {
  id: number;
  title: string;
  image: string;
  category: string;
}

export default function Bienestar() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<NewsItem | null>(null);
  const [noticiasCreadas, setNoticiasCreadas] = useState<Noticia[]>([]);
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const [savedImages, setSavedImages] = useState<Set<number>>(new Set());

  // Cargar noticias creadas al montar el componente
  useEffect(() => {
    const cargarNoticias = () => {
      const noticias = getNoticiasPorCategoriaPrincipal('bienestar');
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

  const [news, setNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: "Meditación para el bienestar mental",
      excerpt: "Descubre cómo la meditación diaria puede mejorar tu salud mental y reducir el estrés.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      category: "MENTAL",
      likes: 50,
      comments: 15,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Muy útil!", author: "Usuario1" },
        { id: 2, text: "Gracias por compartir.", author: "Usuario2" }
      ]
    },
    {
      id: 2,
      title: "Ejercicio físico y salud cardiovascular",
      excerpt: "Cómo mantener un corazón saludable con rutinas de ejercicio adaptadas a tu estilo de vida.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
      category: "SALUD",
      likes: 40,
      comments: 10,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Excelente consejo.", author: "Usuario3" }
      ]
    },
    {
      id: 3,
      title: "Alimentación balanceada para una vida plena",
      excerpt: "Nutrientes esenciales y hábitos alimenticios que promueven el bienestar general.",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
      category: "NUTRICIÓN",
      likes: 35,
      comments: 20,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Me cambió la vida.", author: "Usuario4" }
      ]
    },
    {
      id: 4,
      title: "Sueño reparador: clave del bienestar",
      excerpt: "Importancia del descanso nocturno y tips para mejorar la calidad de tu sueño.",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80",
      category: "SUEÑO",
      likes: 45,
      comments: 8,
      isLiked: false,
      isSaved: false,
      commentsList: [
        { id: 1, text: "Necesitaba esto.", author: "Usuario5" }
      ]
    }
  ]);

  const bienestarDestacadas: BienestarDestacado[] = [
    {
      id: 1,
      title: "Meditación para el bienestar mental",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      category: "MENTAL",
    },
    {
      id: 2,
      title: "Ejercicio físico y salud cardiovascular",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
      category: "SALUD",
    },
    {
      id: 3,
      title: "Alimentación balanceada para una vida plena",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
      category: "NUTRICIÓN",
    },
  ];

  const autores = [
    {
      id: 1,
      nombre: "Dr. Laura Sánchez",
      articulo: "Mente sana en cuerpo sano",
      imagen: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 2,
      nombre: "Marcos Ruiz",
      articulo: "Nutrición para el alma",
      imagen: "https://i.pravatar.cc/100?img=6",
    },
    {
      id: 3,
      nombre: "Sofia López",
      articulo: "El poder del descanso",
      imagen: "https://i.pravatar.cc/100?img=8",
    },
    {
      id: 4,
      nombre: "Pablo Torres",
      articulo: "Movimiento y vitalidad",
      imagen: "https://i.pravatar.cc/100?img=10",
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

  const toggleLikeImage = (id: number) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSaveImage = (id: number) => {
    setSavedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };


  const filteredNews = news;

  return (
    <div className="bienestar-page">
      <div className="bienestar-container">
        {/* Contenido Principal */}
        <div className="bienestar-main-content">
          <CarouselComponent items={bienestarDestacadas} />

          <div className="bienestar-sections">
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

              <div className="bienestar-content-section">
              <h2>BIENESTAR</h2>
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
                        <h3 className="news-title">{item.title}</h3>
                        <p className="news-summary">{item.excerpt}</p>
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
            </div>

            {/* Barra de autores */}
            <div className="bienestar-autores-bar">
              {autores.map((a) => (
                <div key={a.id} className="bienestar-autor">
                  <img src={a.imagen} alt={a.nombre} />
                  <h4>{a.nombre}</h4>
                  <p>{a.articulo}</p>
                </div>
              ))}
            </div>

            {/* BIENESTAR INTEGRAL */}
            <div className="bienestar-content-section">
              <section className="come-saludable-section">
                <div className="come-saludable-text">
                  <h1>BIENESTAR INTEGRAL</h1>
                  <p>
                    El bienestar integral abarca el equilibrio entre cuerpo, mente y espíritu.<br />
                    En un mundo acelerado, es fundamental dedicar tiempo a cuidar de nosotros mismos. El bienestar no se trata solo de estar libre de enfermedades,
                    sino de cultivar una vida plena y significativa. Practicar mindfulness, mantener una alimentación saludable, hacer ejercicio regularmente
                    y fomentar relaciones positivas son pilares esenciales para lograr este equilibrio.<br /><br />
                    La meditación y la reflexión diaria nos ayudan a conectar con nuestro interior, reduciendo el estrés y mejorando la claridad mental.
                    Una dieta rica en nutrientes naturales fortalece nuestro cuerpo, mientras que el movimiento físico libera endorfinas que elevan nuestro ánimo.
                    Además, rodearnos de personas que nos apoyan y nos inspiran crea un entorno propicio para el crecimiento personal.<br /><br />
                    Recuerda que el bienestar es un viaje continuo. Pequeños cambios diarios pueden llevar a transformaciones profundas.
                    Prioriza tu salud mental, cuida tu cuerpo y nutre tu alma para vivir una vida más plena y satisfactoria.
                  </p>
                </div>
                <div className="come-saludable-images">
                  {[
                    { id: 1, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" },
                    { id: 2, src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
                    { id: 3, src: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop" },
                    { id: 4, src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop" }
                  ].map(item => (
                    <Card key={item.id} className="news-card" cover={<img src={item.src} alt={`Imagen bienestar ${item.id}`} className="news-image" />}>
                      <div className="news-content">
                        <div className="image-actions">
                          <Button type="text" size="small" icon={<Heart size={18} />} onClick={() => toggleLikeImage(item.id)} className={"action-btn " + (likedImages.has(item.id) ? "like-active" : "")}></Button>
                          <Button type="text" size="small" icon={<MessageCircle size={18} />} onClick={() => handleOpenComments({id: 9999 + item.id, title: `Imagen Bienestar ${item.id}`, excerpt: "", image: item.src, category: "BIENESTAR INTEGRAL", likes: 0, comments: 0, isLiked: false, isSaved: false, commentsList: []})} className="action-btn">Comentar</Button>
                          <Button type="text" size="small" icon={<Bookmark size={18} />} onClick={() => toggleSaveImage(item.id)} className={"action-btn " + (savedImages.has(item.id) ? "save-active" : "")}></Button>
                          <Button type="text" size="small" icon={<Share2 size={18} />} className="action-btn">Compartir</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de comentarios */}
      {selectedNoticia && (
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={handleCloseComments}
          noticiaId={selectedNoticia.id}
          noticiaTitle={selectedNoticia.title}
        />
      )}

      <Footer />
    </div>
  );
}
