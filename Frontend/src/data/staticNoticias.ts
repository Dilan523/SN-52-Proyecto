import type { Noticia } from "../services/noticias";

// Noticias estáticas centrales usadas en el sitio (relevantes y destacadas)
export const staticNoticias: Noticia[] = [
  {
    id: 100001,
    titulo: "Avances Tecnológicos en Educación",
    contenido: "<p><strong>La educación avanza con tecnología...</strong> texto completo del artículo.</p>",
    contenidoTexto: "Resumen y extracto sobre avances tecnológicos en educación.",
    categoria: "EDUCACIÓN",
    fecha: "2025-09-20",
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=500&fit=crop",
    etiquetas: ["tecnología", "educación"],
    likes: 0,
    comentarios: 0,
    compartidos: 0,
    autor: "Redacción",
    estado: "publicado",
  },
  {
    id: 100002,
    titulo: "Innovación en Proyectos Culturales",
    contenido: "<p>Contenido sobre innovación en proyectos culturales.</p>",
    contenidoTexto: "Resumen sobre proyectos culturales innovadores.",
    categoria: "CULTURA",
    fecha: "2025-09-18",
    imagen: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop",
    etiquetas: ["cultura"],
    likes: 0,
    comentarios: 0,
    compartidos: 0,
    autor: "Redacción",
    estado: "publicado",
  },
];

export const featuredNewsHome = [
  {
    id: 2001,
    title: "Avances Tecnológicos en Educación",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=500&fit=crop",
    category: "EDUCACIÓN",
  },
  {
    id: 2002,
    title: "Innovación en Proyectos Culturales",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop",
    category: "CULTURA",
  },
  {
    id: 2003,
    title: "Nuevos Descubrimientos Científicos",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=500&fit=crop",
    category: "CIENCIA",
  }
];

export const noticiasRelevantes = [
  {
    id: 3001,
    titulo: "Estudiantes del SENA crean aplicación innovadora",
    descripcion: "Un grupo de aprendices del SENA desarrolló una app para mejorar la gestión de proyectos educativos.",
    fecha: "2025-09-15",
    autor: "Redacción SN-52",
    imagen: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
    categoria: "TECNOLOGÍA",
    contenidoTexto: "Aprendices desarrollan aplicación educativa para optimizar proyectos.",
    likes: 10,
    comentarios: 3,
    compartidos: 2,
  },
  {
    id: 3002,
    titulo: "Nueva convocatoria de formación virtual",
    descripcion: "El SENA abre inscripciones para más de 20 programas...",
    fecha: "2025-09-14",
    autor: "Comunicaciones SENA",
    imagen: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
    categoria: "EDUCACIÓN",
    contenidoTexto: "Convocatoria abierta para programas técnicos y tecnológicos virtuales.",
    likes: 8,
    comentarios: 5,
    compartidos: 1,
  },
  // Puedes añadir más items aquí replicando el formato usado en home.tsx
];

export default { staticNoticias, featuredNewsHome, noticiasRelevantes };
