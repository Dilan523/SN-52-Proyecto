INSERT INTO roles (id_rol, fecha_creacion, nombre) VALUES
(1, CURDATE(), 'lector'),
(2, CURDATE(), 'escritor'),
(3, CURDATE(), 'editor'),
(4, CURDATE(), 'admin')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), fecha_creacion = VALUES(fecha_creacion);


INSERT INTO categorias (fecha_creacion, estado, nombre)
VALUES
(NOW(), 1, 'Deportes'),
(NOW(), 1, 'Bienestar'),
(NOW(), 1, 'Cultura'),
(NOW(), 1, 'Arte');
