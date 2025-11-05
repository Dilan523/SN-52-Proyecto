import React, { useState, useRef, useEffect, useContext } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  Heading2,
  Upload,
  Save,
  Send,
  X,
  Plus,
  Eye
} from "lucide-react";
import { UserContext } from "../../context/UserContextValue";
import { crearNoticia } from "../../services/noticias";
import { useAlert } from "../../hooks/useAlert";
import "./CrearArt.css";

const CrearArt: React.FC = () => {
  const { user } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [titulo, setTitulo] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [publicado, setPublicado] = useState<boolean>(false);
  const [borrador, setBorrador] = useState<boolean>(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuración del editor Tiptap con más funcionalidades
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Escribe tu artículo aquí...</p>",
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("El archivo es muy grande. Máximo 5MB permitido.", "error");
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showAlert("Por favor selecciona un archivo de imagen válido.", "error");
        return;
      }

      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagenPreview) {
      URL.revokeObjectURL(imagenPreview);
    }
    setImagen(null);
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !etiquetas.includes(nuevaEtiqueta.trim())) {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta("");
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter(e => e !== etiqueta));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarEtiqueta();
    }
  };

  useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    };
  }, [imagenPreview]);

  const validarFormulario = (): boolean => {
    if (!titulo.trim()) {
      showAlert("Por favor ingresa un título para el artículo.", "error");
      return false;
    }
    if (!categoria) {
      showAlert("Por favor selecciona una categoría.", "error");
      return false;
    }
    if (!fecha) {
      showAlert("Por favor selecciona una fecha de publicación.", "error");
      return false;
    }
    if (!editor?.getText().trim() || editor.getText().trim() === "Escribe tu artículo aquí...") {
      showAlert("Por favor escribe el contenido del artículo.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const noticiaData = {
        titulo: titulo.trim(),
        contenido: editor?.getHTML() || "",
        contenidoTexto: editor?.getText() || "",
        categoria,
        fecha,
        imagen: imagenPreview || undefined,
        etiquetas,
        autor: user ? `${user.nombre} ${user.apellidos}` : "Usuario Anónimo",
        estado: (publicado ? "publicado" : "borrador") as "publicado" | "borrador"
      };

      await crearNoticia(noticiaData);

      showAlert("¡Artículo publicado exitosamente!", "success");

      // Limpiar formulario
      limpiarFormulario();

    } catch (error) {
      console.error("Error al enviar el artículo:", error);
      showAlert("Hubo un error al publicar el artículo. Intenta nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const guardarBorrador = async () => {
    if (!titulo.trim()) {
      showAlert("Por favor ingresa al menos un título para guardar el borrador.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const borradorData = {
        titulo: titulo.trim(),
        categoria,
        fecha,
        contenido: editor?.getHTML() || "",
        etiquetas,
        imagen: imagenPreview,
        fechaGuardado: new Date().toISOString()
      };

      // Guardar en localStorage como ejemplo
      localStorage.setItem(`borrador_${Date.now()}`, JSON.stringify(borradorData));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert("Borrador guardado exitosamente.", "success");
    } catch (error) {
      console.error("Error al guardar borrador:", error);
      showAlert("Error al guardar el borrador.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setCategoria("");
    setFecha("");
    setPublicado(false);
    setBorrador(false);
    setEtiquetas([]);
    setNuevaEtiqueta("");
    removeImage();
    editor?.commands.setContent("<p>Escribe tu artículo aquí...</p>");
    setPreviewMode(false);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Obtener fecha actual para establecer como mínimo
  const fechaActual = new Date().toISOString().split('T')[0];

  return (
    <div className="crearart-crear-articulo-container">
      <div className="crearart-header-section">
        <h2 className="crearart-page-title">
          {previewMode ? "Vista Previa del Artículo" : "Crear Nuevo Artículo"}
        </h2>
        <div className="crearart-header-actions">
          <button
            type="button"
            className="crearart-btn-preview"
            onClick={togglePreview}
            disabled={isLoading}
          >
            <Eye size={18} />
            {previewMode ? "Editar" : "Vista Previa"}
          </button>
        </div>
      </div>

      {previewMode ? (
        // Vista previa del artículo
        <div className="crearart-preview-container">
          <div className="crearart-preview-header">
            {imagenPreview && (
              <img src={imagenPreview} alt="Imagen del artículo" className="crearart-preview-image" />
            )}
            <div className="crearart-preview-meta">
              <span className="crearart-preview-category">{categoria || "Sin categoría"}</span>
              <h1 className="crearart-preview-title">{titulo || "Sin título"}</h1>
              <p className="crearart-preview-date">{fecha ? new Date(fecha).toLocaleDateString('es-ES') : "Sin fecha"}</p>
              {etiquetas.length > 0 && (
                <div className="crearart-preview-tags">
                  {etiquetas.map((etiqueta, index) => (
                    <span key={index} className="crearart-preview-tag">#{etiqueta}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="crearart-preview-content">
            {editor && (
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            )}
          </div>
        </div>
      ) : (
        // Formulario de edición
        <form onSubmit={handleSubmit} className="crearart-article-form">
          <div className="crearart-form-grid">
            {/* Columna izquierda */}
            <div className="crearart-form-left">
              <div className="crearart-form-group">
                <label className="crearart-form-label">
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Escribe un título atractivo..."
                  className="crearart-form-input"
                  maxLength={100}
                  required
                />
                <span className="crearart-char-count">{titulo.length}/100</span>
              </div>

              <div className="crearart-image-upload-section">
                <label className="crearart-form-label">Imagen Principal</label>

                <div className="crearart-image-upload-area" onClick={handleImageClick}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />

                  {imagenPreview ? (
                    <div className="crearart-image-preview-container">
                      <img src={imagenPreview} alt="Vista previa" className="crearart-image-preview" />
                      <button
                        type="button"
                        className="crearart-remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="crearart-upload-placeholder">
                      <Upload size={32} />
                      <span>Haz clic para subir una imagen</span>
                      <small>PNG, JPG hasta 5MB</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="crearart-form-row">
                <div className="crearart-form-group">
                  <label className="crearart-form-label">Categoría *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="crearart-form-select"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="deportes">Deportes</option>
                    <option value="bienestar">Bienestar</option>
                    <option value="cultura">Cultura</option>
                    <option value="arte">Arte</option>
                  </select>
                </div>

                <div className="crearart-form-group">
                  <label className="crearart-form-label">Fecha de Publicación *</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={fechaActual}
                    className="crearart-form-input"
                    required
                  />
                </div>
              </div>

              <div className="crearart-form-group">
                <label className="crearart-form-label">Etiquetas</label>
                <div className="crearart-tags-input-container">
                  <input
                    type="text"
                    value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe una etiqueta y presiona Enter"
                    className="crearart-form-input"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={agregarEtiqueta}
                    className="crearart-add-tag-btn"
                    disabled={!nuevaEtiqueta.trim()}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {etiquetas.length > 0 && (
                  <div className="crearart-tags-list">
                    {etiquetas.map((etiqueta, index) => (
                      <span key={index} className="crearart-tag-item">
                        #{etiqueta}
                        <button
                          type="button"
                          onClick={() => eliminarEtiqueta(etiqueta)}
                          className="crearart-remove-tag-btn"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha - Editor */}
            <div className="crearart-form-right">
              <div className="crearart-form-group">
                <label className="crearart-form-label">Contenido del Artículo *</label>

                <div className="crearart-editor-section">
                  <div className="crearart-toolbar">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`crearart-toolbar-btn ${editor?.isActive('bold') ? 'active' : ''}`}
                      title="Negrita"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`crearart-toolbar-btn ${editor?.isActive('italic') ? 'active' : ''}`}
                      title="Cursiva"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`crearart-toolbar-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
                      title="Lista con viñetas"
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`crearart-toolbar-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                      title="Encabezado"
                    >
                      <Heading2 size={16} />
                    </button>
                  </div>

                  <div className="crearart-editor-container">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              <div className="crearart-form-group">
                <label className="crearart-form-label">Opciones de Publicación</label>
                <div className="crearart-checkboxes">
                  <label className="crearart-checkbox-label">
                    <input
                      type="checkbox"
                      checked={publicado}
                      onChange={(e) => {
                        setPublicado(e.target.checked);
                        if (e.target.checked) setBorrador(false);
                      }}
                    />
                    <span>Publicar inmediatamente</span>
                  </label>
                  <label className="crearart-checkbox-label">
                    <input
                      type="checkbox"
                      checked={borrador}
                      onChange={(e) => {
                        setBorrador(e.target.checked);
                        if (e.target.checked) setPublicado(false);
                      }}
                    />
                    <span>Guardar como borrador</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="crearart-form-actions">
            <button
              type="button"
              onClick={guardarBorrador}
              className="crearart-btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="crearart-spinner"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Borrador
                </>
              )}
            </button>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="crearart-btn-outline"
              disabled={isLoading}
            >
              Limpiar
            </button>

            <button
              type="submit"
              className="crearart-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="crearart-spinner"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Publicar Artículo
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CrearArt;
