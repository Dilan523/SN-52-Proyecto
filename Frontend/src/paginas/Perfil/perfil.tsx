 import React, { useState, useEffect, useContext } from "react";
import "./Perfil.css";  
import perfilDefault from "../../assets/Img/perfil.jpg";
import s1 from "../../assets/Img/S1.png";
import s2 from "../../assets/Img/S2.png";
import s3 from "../../assets/Img/S3.png";
import { UserContext } from "../../context/UserContext";
import { useAlert } from "../../hooks/useAlert";
import { getSavedArticles, toggleSaveNoticia, type Noticia } from "../../services/noticias";
import { Heart, MessageCircle, Share2, Bookmark, Trash2 } from "lucide-react";
import CommentsModal from "../../components/CommentsModal";

const Perfil: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'editar' | 'guardados'>('editar');
  const [foto, setFoto] = useState<string>(perfilDefault);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [savedArticles, setSavedArticles] = useState<Noticia[]>([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setApellidos(user.apellidos || "");
      setEmail(user.email || "");
      if (user.foto) setFoto(`http://localhost:8000/uploads/${user.foto}`);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'guardados') {
      setSavedArticles(getSavedArticles());
    }
  }, [activeTab]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append("nombre_usuario", nombre);
    formData.append("apellido_usuario", apellidos);
    formData.append("correo_usuario", email);
    if (fotoFile) formData.append("foto_usuario", fotoFile);
    if (password && password === confirmPassword) {
      formData.append("password", password);
    } else if (password) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/auth/update/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al actualizar perfil");

      const data = await res.json();

      // Actualizamos contexto y localStorage
      const updatedUser = {
        ...user,
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.correo,
        foto: data.foto,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showAlert("Perfil actualizado con éxito ✅", "success");
    } catch (error) {
      console.error(error);
      showAlert("Hubo un error al actualizar perfil ❌", "error");
    }
  };

  const handleRemoveSaved = (articleId: number) => {
    toggleSaveNoticia(articleId);
    setSavedArticles(prev => prev.filter(article => article.id !== articleId));
    showAlert("Artículo eliminado de guardados", "success");
  };

  const handleOpenComments = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedNoticia(null);
  };

  return (
    <div className="app">
      {/* Navegación por pestañas */}
      <div className="perfil-tabs-navigation">
        <button
          className={`perfil-tab-btn ${activeTab === 'editar' ? 'active' : ''}`}
          onClick={() => setActiveTab('editar')}
        >
          Editar Perfil
        </button>
        <button
          className={`perfil-tab-btn ${activeTab === 'guardados' ? 'active' : ''}`}
          onClick={() => setActiveTab('guardados')}
        >
          Mis Artículos Guardados
        </button>
      </div>

      <div className="perfil-perfil-container">
        <div className="perfil-perfil-header">
          <h2 className="perfil-titulo">
            {activeTab === 'editar' ? 'Perfil de Usuario' : 'Mis Artículos Guardados'}
          </h2>
          <p>
            {activeTab === 'editar'
              ? 'Actualiza tu foto de perfil y detalles personales.'
              : 'Aquí puedes ver todos los artículos que has guardado para leer más tarde.'
            }
          </p>
        </div>

        {/* Contenido de las pestañas */}
        <div className="tab-content">
          {activeTab === 'editar' && (
            <div className="perfil-perfil-content">
              <div className="perfil-foto-container">
                <div className="perfil-upload-box">
                  <img src={foto} alt="perfil" className="perfil-perfil" />
                </div>
                <label htmlFor="fotoInput" className="perfil-foto-btn">
                  <span> Cambiar Foto</span>
                </label>
                <input
                  id="fotoInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: "none" }}
                />
              </div>

                <form onSubmit={handleSubmit}>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Usuario"
                    required
                  />

                  <label htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos"
                    type="text"
                    value={apellidos}
                    onChange={e => setApellidos(e.target.value)}
                    placeholder="Ejemplo"
                    required
                  />

                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nueva contraseña (opcional)"
                  />

                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nueva contraseña"
                  />

                  <button type="submit" className="perfil-form-btn">
                    Guardar Cambios
                  </button>
                </form>
            </div>
          )}

          {activeTab === 'guardados' && (
            <div className="perfil-saved-articles-container">
              {savedArticles.length > 0 ? (
                <div className="perfil-articles-grid">
                  {savedArticles.map((noticia) => (
                    <article key={noticia.id} className="perfil-article-card">
                      {noticia.imagen && (
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="perfil-news-image"
                        />
                      )}
                      <div className="perfil-news-content">
                        <span className="perfil-news-category">{noticia.categoria.toUpperCase()}</span>
                        <h3 className="perfil-news-title">{noticia.titulo}</h3>
                        <p className="perfil-news-summary">
                          {noticia.contenidoTexto.length > 150
                            ? noticia.contenidoTexto.substring(0, 150) + '...'
                            : noticia.contenidoTexto}
                        </p>
                        <div className="perfil-news-meta">
                          <span className="news-author">{noticia.autor}</span>
                          <span className="news-date">{new Date(noticia.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="perfil-news-actions">
                          <button
                            onClick={() => handleOpenComments(noticia)}
                            className="perfil-action-btn perfil-comment-btn"
                          >
                            <MessageCircle size={16} />
                            <span>{noticia.comentarios}</span>
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(noticia.id)}
                            className="perfil-action-btn perfil-remove-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="perfil-no-articles">
                  <p>No tienes artículos guardados aún.</p>
                  <p>¡Explora el sitio y guarda los artículos que te interesen!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <img src={s1} alt="Decoración" className="perfil-perfil-decor-top-left" />
      <img src={s2} alt="decoración 2" className="perfil-perfil-decor-top-right" />
      <img src={s3} alt="decoración 3" className="perfil-perfil-decor-bottom-left" />

      {/* Modal de comentarios */}
      {selectedNoticia && (
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={handleCloseComments}
          noticiaId={selectedNoticia.id}
          noticiaTitle={selectedNoticia.titulo}
        />
      )}
    </div>
  );
};

export default Perfil;
