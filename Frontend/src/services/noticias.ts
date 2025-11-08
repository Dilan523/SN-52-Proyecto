import axios from 'axios';

export interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  contenidoTexto: string;
  categoria: string;
  fecha: string;
  imagen?: string;
  etiquetas: string[];
  likes: number;
  comentarios: number;
  compartidos: number;
  autor: string;
  estado: 'borrador' | 'publicado';
}

const STORAGE_KEY = 'noticias_creadas';

// Función para obtener todas las noticias creadas desde localStorage
export const getNoticiasCreadas = (): Noticia[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    return [];
  }
};

// Función para guardar una nueva noticia
export const crearNoticia = async (noticiaData: Omit<Noticia, 'id' | 'likes' | 'comentarios' | 'compartidos'>): Promise<Noticia> => {
  try {
    // Simular envío al backend (por ahora localStorage)
    const noticias = getNoticiasCreadas();
    const nuevaNoticia: Noticia = {
      ...noticiaData,
      id: Date.now(), // ID único basado en timestamp
      likes: 0,
      comentarios: 0,
      compartidos: 0,
    };

    noticias.unshift(nuevaNoticia); // Agregar al inicio
    localStorage.setItem(STORAGE_KEY, JSON.stringify(noticias));

    // Aquí irá la llamada real al backend cuando esté listo
    // const response = await axios.post('/api/noticias', noticiaData);
    // return response.data;

    return nuevaNoticia;
  } catch (error) {
    console.error('Error al crear noticia:', error);
    throw error;
  }
};

// Función para actualizar likes de una noticia
export const toggleLikeNoticia = (id: number): void => {
  const noticias = getNoticiasCreadas();
  const index = noticias.findIndex(n => n.id === id);
  if (index !== -1) {
    // Aquí se podría hacer una llamada al backend para likes
    // Por ahora, solo local
    noticias[index].likes += 1; // Simplificado, en realidad toggle
    localStorage.setItem(STORAGE_KEY, JSON.stringify(noticias));
  }
};

// Función para obtener artículos guardados
export const getSavedArticles = (): Noticia[] => {
  try {
    const saved = localStorage.getItem('saved_articles');
    const savedIds = saved ? JSON.parse(saved) : [];
    const allNoticias = getNoticiasCreadas();
    return allNoticias.filter(noticia => savedIds.includes(noticia.id));
  } catch (error) {
    console.error('Error al obtener artículos guardados:', error);
    return [];
  }
};

// Función para guardar/desguardar artículo
export const toggleSaveNoticia = (id: number): void => {
  try {
    const saved = localStorage.getItem('saved_articles');
    let savedIds = saved ? JSON.parse(saved) : [];
    const index = savedIds.indexOf(id);
    if (index > -1) {
      savedIds.splice(index, 1); // Remover si ya está guardado
    } else {
      savedIds.push(id); // Agregar si no está guardado
    }
    localStorage.setItem('saved_articles', JSON.stringify(savedIds));
  } catch (error) {
    console.error('Error al guardar artículo:', error);
  }
};

// Función para compartir noticia
export const shareNoticia = (noticia: Noticia): void => {
  if (navigator.share) {
    navigator.share({
      title: noticia.titulo,
      text: noticia.contenidoTexto.substring(0, 100) + '...',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles');
  }
};

// Función para obtener noticias por categoría (simulado)
export const getNoticiasPorCategoria = (categoria: string): Noticia[] => {
  const noticias = getNoticiasCreadas();
  return noticias.filter(n => n.categoria.toLowerCase() === categoria.toLowerCase());
};

// Función para mapear subcategorías a categorías principales
export const mapearCategoriaPrincipal = (categoria: string): string => {
  const categoriaLower = categoria.toLowerCase();
  if (['salud', 'entrenamiento', 'nutrición', 'recuperación', 'fútbol', 'atletismo', 'tecnología'].includes(categoriaLower)) {
    return 'deportes';
  }
  if (['literatura', 'música', 'cine', 'tradiciones'].includes(categoriaLower)) {
    return 'cultura';
  }
  if (['pintura', 'teatro', 'fotografía', 'música'].includes(categoriaLower)) {
    return 'arte';
  }
  if (categoriaLower === 'bienestar') {
    return 'bienestar';
  }
  return categoriaLower;
};

// Función para obtener noticias por categoría principal (incluyendo subcategorías)
export const getNoticiasPorCategoriaPrincipal = (categoriaPrincipal: string): Noticia[] => {
  const noticias = getNoticiasCreadas();
  return noticias.filter(n => mapearCategoriaPrincipal(n.categoria) === categoriaPrincipal.toLowerCase());
};
