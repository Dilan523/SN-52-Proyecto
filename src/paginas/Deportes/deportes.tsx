import React, { useState, useContext, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import CarouselComponent from '../../components/CarouselComponent';
import './deportes.css';
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

interface ArteDestacado {
  id: number;
  title: string;
  image: string;
  category: string;
}

export default function Deportes() {
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
      const noticias = getNoticiasPorCategoriaPrincipal('deportes');
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
      title: "El deporte no es solo cuestión de agilidad física y mental",
      excerpt: "El deporte no es solo cuestión de agilidad física, bienestar y calidad de vida...",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      category: "SALUD",
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
      title: "Nuevas técnicas de entrenamiento revolucionan el atletismo",
      excerpt: "Los últimos avances en ciencias del deporte están cambiando la forma...",
      image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop",
      category: "ENTRENAMIENTO",
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
      title: "Impacto de la nutrición en el rendimiento deportivo",
      excerpt: "Una alimentación adecuada puede marcar la diferencia entre ganar y perder...",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
      category: "NUTRICIÓN",
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
      title: "La importancia del descanso en el deporte",
      excerpt: "El sueño y la recuperación son tan importantes como el entrenamiento mismo...",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
      category: "RECUPERACIÓN",
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
      title: "Final del Campeonato Mundial de Fútbol",
      image:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=500&fit=crop",
      category: "FÚTBOL",
    },
    {
      id: 2,
      title: "Nuevos récords en atletismo olímpico",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=500&fit=crop",
      category: "ATLETISMO",
    },
    {
      id: 3,
      title: "Innovaciones en equipamiento deportivo",
      image:
        "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&h=500&fit=crop",
      category: "TECNOLOGÍA",
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
    <div className="deportes-page news-body">
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
              image: noticia.imagen || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
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

        {/* COME SALUDABLE */}
        <section className="come-saludable-section">
          <div className="come-saludable-text">
            <h1>COME SALUDABLE</h1>
          <p>
            La importancia de la alimentación en el entrenamiento<br />
            Cuando hablamos de entrenar, muchos piensan solo en el ejercicio físico, pero la verdad es que una parte
            fundamental del rendimiento y los resultados está en la alimentación. Comer bien no solo ayuda a tener energía para entrenar
            , sino que también permite una mejor recuperación, evita lesiones y mejora el desempeño en cada sesión.<br /><br />
            Una alimentación adecuada aporta los nutrientes que el cuerpo necesita para funcionar correctamente. Los carbohidratos son la
            principal fuente de energía, las proteínas ayudan a reparar y fortalecer los músculos, y las grasas saludables mantienen el buen
            ionamiento del cuerpo. Además, las vitaminas y minerales juegan un papel clave en mantenernos activos, prevenir fatiga y regular
            los procesos internos.<br /><br />
            Cuando se entrena sin una buena alimentación, el cuerpo se desgasta, se vuelve
            más propenso a enfermarse y los resultados tardan mucho más en verse. Por eso, cuidar lo que se
            come antes, durante y después del ejercicio es tan importante como el entrenamiento mismo.<br /><br />
            Al final, cuerpo y mente trabajan juntos, y una alimentación equilibrada es el combustible que mantiene
            esa máquina andando.<br />
            Comer bien no es solo por estética, sino por salud, bienestar y por respeto al esfuerzo que se hace en cada entrenamiento.<br />
            La comida saludable aporta nutrientes esenciales que fortalecen el cuerpo, mejoran la energía y favorecen la recuperación
            muscular. Mantener una buena alimentación potencia el rendimiento y optimiza los resultados del entrenamiento diario.
          </p>
          </div>
          <div className="come-saludable-images">
            {[
              { id: 1, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" },
              { id: 2, src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop" },
              { id: 3, src: "https://infociudad.com.ar/wp-content/uploads/2017/10/comida-sana-a-domicilio-1-1024x684.jpg" },
              { id: 4, src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop" }
            ].map(item => (
              <Card key={item.id} className="news-card" cover={<img src={item.src} alt={`Imagen saludable ${item.id}`} className="news-image" />}>
                <div className="news-content">
                  <div className="news-actions">
                    <Button type="text" size="small" icon={<Heart size={18} />} onClick={() => toggleLikeImage(item.id)} className={"action-btn " + (likedImages.has(item.id) ? "like-active" : "")}></Button>
                    <Button type="text" size="small" icon={<MessageCircle size={18} />} onClick={() => handleOpenComments({id: 9999 + item.id, title: `Imagen Saludable ${item.id}`, excerpt: "", image: item.src, category: "COME SALUDABLE", likes: 0, comments: 0, isLiked: false, isSaved: false, commentsList: []})} className="action-btn">Comentar</Button>
                    <Button type="text" size="small" icon={<Bookmark size={18} />} onClick={() => toggleSaveImage(item.id)} className={"action-btn " + (savedImages.has(item.id) ? "save-active" : "")}></Button>
                    <Button type="text" size="small" icon={<Share2 size={18} />} className="action-btn">Compartir</Button>
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