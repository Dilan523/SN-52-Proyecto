import axios from 'axios';

export interface Comment {
  id: number;
  text: string;
  author: string;
  date: string;
  noticiaId: number;
  userId?: number;
  userPhoto?: string;
}

interface ApiComment {
  id_comentario: number;
  contenido: string;
  fecha_creacion: string;
  noticia_id: number;
  usuario: {
    id: number;
    nombre: string;
    foto?: string;
  };
}

interface ApiCommentResponse {
  id_comentario: number;
  contenido: string;
  fecha_creacion: string;
  noticia_id: number;
  usuario: {
    id: number;
    nombre: string;
    foto?: string;
  };
}

interface ApiCommentCreate {
  contenido: string;
  noticia_id: number;
  usuario_id: number;
}

interface CommentsCountResponse {
  count: number;
  noticia_id: number;
}

const API_BASE_URL = 'http://localhost:8000';

// Configurar axios con interceptores para mejor manejo de errores
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.detail || 'Error del servidor';
      console.error('API Error:', message);
      throw new Error(message);
    } else if (error.request) {
      // Error de red
      console.error('Network Error:', error.message);
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Otro tipo de error
      console.error('Request Error:', error.message);
      throw new Error('Error inesperado. Intenta de nuevo.');
    }
  }
);

export const commentsService = {
  /**
   * Obtener comentarios de una noticia
   * @param noticiaId - ID de la noticia
   * @param limit - Límite de comentarios (default: 50)
   * @param offset - Offset para paginación (default: 0)
   */
  async getComments(
    noticiaId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Comment[]> {
    try {
      const response = await api.get<ApiComment[]>(
        `/api/comentarios/${noticiaId}?limit=${limit}&offset=${offset}`
      );

      return response.data.map((comment: ApiComment) => ({
        id: comment.id_comentario,
        text: comment.contenido,
        author: comment.usuario.nombre,
        date: formatDate(comment.fecha_creacion),
        noticiaId: comment.noticia_id,
        userId: comment.usuario.id,
        userPhoto: comment.usuario.foto
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  /**
   * Agregar un nuevo comentario
   * @param noticiaId - ID de la noticia
   * @param contenido - Contenido del comentario
   * @param usuarioId - ID del usuario
   */
  async addComment(
    noticiaId: number,
    contenido: string,
    usuarioId: number
  ): Promise<Comment> {
    try {
      const commentData: ApiCommentCreate = {
        contenido: contenido.trim(),
        noticia_id: noticiaId,
        usuario_id: usuarioId
      };

      const response = await api.post<ApiCommentResponse>(
        '/api/comentarios',
        commentData
      );

      const data = response.data;
      return {
        id: data.id_comentario,
        text: data.contenido,
        author: data.usuario.nombre,
        date: formatDate(data.fecha_creacion),
        noticiaId: data.noticia_id,
        userId: data.usuario.id,
        userPhoto: data.usuario.foto
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error; // Re-throw para que el componente maneje el error
    }
  },

  /**
   * Eliminar un comentario
   * @param comentarioId - ID del comentario
   * @param usuarioId - ID del usuario (para verificar permisos)
   */
  async deleteComment(comentarioId: number, usuarioId: number): Promise<void> {
    try {
      await api.delete(`/api/comentarios/${comentarioId}?usuario_id=${usuarioId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Obtener el conteo de comentarios de una noticia
   * @param noticiaId - ID de la noticia
   */
  async getCommentsCount(noticiaId: number): Promise<number> {
    try {
      const response = await api.get<CommentsCountResponse>(
        `/api/noticias/${noticiaId}/comentarios/count`
      );
      return response.data.count;
    } catch (error) {
      console.error('Error getting comments count:', error);
      return 0;
    }
  }
};

// Función auxiliar para formatear fechas
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return diffInMinutes <= 1 ? 'hace un momento' : `hace ${diffInMinutes} minutos`;
      }
      return `hace ${diffInHours} horas`;
    } else if (diffInHours < 24 * 7) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}

export default commentsService;
