import type { Noticia } from "../services/noticias";
import { getNoticiasCreadas } from "../services/noticias";
import { staticNoticias as baseStatic, noticiasRelevantes as baseRelevantes } from "./staticNoticias";

// Centralizamos las fuentes de noticias del sitio:
// - baseStatic: noticias estáticas que vienen por defecto
// - creadas: noticias creadas por el usuario en localStorage
export const getAllArticles = (): Noticia[] => {
  const creadas = getNoticiasCreadas();

  // Normalizar las noticias relevantes (pueden venir con menos campos)
  const relevantes: Noticia[] = baseRelevantes.map((r: any) => ({
    id: r.id,
    titulo: r.titulo,
    contenido: r.contenido || r.descripcion || r.contenidoTexto || '',
    contenidoTexto: r.contenidoTexto || r.descripcion || '',
    categoria: r.categoria || 'GENERAL',
    fecha: r.fecha || new Date().toISOString().split('T')[0],
    imagen: r.imagen || '',
    etiquetas: r.etiquetas || [],
    likes: r.likes || 0,
    comentarios: r.comentarios || 0,
    compartidos: r.compartidos || 0,
    autor: r.autor || 'Redacción',
    estado: r.estado || 'publicado',
  }));

  // Unimos las noticias estáticas, las relevantes normalizadas y las creadas por el usuario
  const combined = [...baseStatic, ...relevantes, ...creadas];

  // Dedupe por id (última aparición gana: creadas pueden sobrescribir estáticas)
  const uniqMap = new Map<string, Noticia>();
  combined.forEach((a) => uniqMap.set(String(a.id), a));
  const unique = Array.from(uniqMap.values());

  return unique;
};

export default getAllArticles;
