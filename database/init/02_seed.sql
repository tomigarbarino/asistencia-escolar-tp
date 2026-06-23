USE asistencia_escolar;

INSERT INTO rol (id_rol, nombre_rol) VALUES
  (1, 'Preceptor'),
  (2, 'Docente'),
  (3, 'Secretaria'),
  (4, 'Direccion')
ON DUPLICATE KEY UPDATE nombre_rol = VALUES(nombre_rol);

INSERT INTO usuario (id_usuario, nombre_usuario, clave, id_rol, estado) VALUES
  (1, 'preceptor.demo', 'demo123', 1, 'activo'),
  (2, 'docente.demo', 'demo123', 2, 'activo'),
  (3, 'secretaria.demo', 'demo123', 3, 'activo'),
  (4, 'direccion.demo', 'demo123', 4, 'activo')
ON DUPLICATE KEY UPDATE
  clave = VALUES(clave),
  id_rol = VALUES(id_rol),
  estado = VALUES(estado);

INSERT INTO alumno (id_alumno, dni, nombre, apellido, fecha_nacimiento, domicilio, estado) VALUES
  (1, 45111222, 'Valentina', 'Perez', '2011-04-12', 'San Martin 120', 'activo'),
  (2, 45222333, 'Mateo', 'Gomez', '2011-06-03', 'Belgrano 455', 'activo'),
  (3, 45333444, 'Sofia', 'Rodriguez', '2011-09-18', 'Sarmiento 980', 'activo'),
  (4, 45444555, 'Benjamin', 'Lopez', '2011-11-24', 'Moreno 315', 'activo'),
  (5, 45555666, 'Camila', 'Fernandez', '2011-02-07', 'Rivadavia 220', 'activo'),
  (6, 45666777, 'Joaquin', 'Martinez', '2010-12-15', 'Mitre 742', 'activo'),
  (7, 45777888, 'Martina', 'Sanchez', '2010-05-30', 'Alberdi 641', 'activo'),
  (8, 45888999, 'Thiago', 'Diaz', '2010-08-21', 'Urquiza 1040', 'activo')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  fecha_nacimiento = VALUES(fecha_nacimiento),
  domicilio = VALUES(domicilio),
  estado = VALUES(estado);

INSERT INTO tutor (id_tutor, dni, nombre, apellido, telefono, email) VALUES
  (1, 30111222, 'Laura', 'Perez', '1122334455', 'laura.perez@example.com'),
  (2, 30222333, 'Carlos', 'Gomez', '1133445566', 'carlos.gomez@example.com'),
  (3, 30333444, 'Andrea', 'Rodriguez', '1144556677', 'andrea.rodriguez@example.com'),
  (4, 30444555, 'Diego', 'Lopez', '1155667788', 'diego.lopez@example.com')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  telefono = VALUES(telefono),
  email = VALUES(email);

INSERT INTO alumno_tutor (id_alumno_tutor, id_alumno, id_tutor, parentesco) VALUES
  (1, 1, 1, 'madre'),
  (2, 2, 2, 'padre'),
  (3, 3, 3, 'madre'),
  (4, 4, 4, 'padre')
ON DUPLICATE KEY UPDATE parentesco = VALUES(parentesco);

INSERT INTO curso (id_curso, anio, division, turno, ciclo_lectivo) VALUES
  (1, 1, 'A', 'manana', 2026),
  (2, 2, 'B', 'tarde', 2026),
  (3, 3, 'C', 'manana', 2026)
ON DUPLICATE KEY UPDATE
  anio = VALUES(anio),
  division = VALUES(division),
  turno = VALUES(turno),
  ciclo_lectivo = VALUES(ciclo_lectivo);

INSERT INTO matricula (id_matricula, id_alumno, id_curso, fecha_alta, estado) VALUES
  (1, 1, 1, '2026-03-01', 'activa'),
  (2, 2, 1, '2026-03-01', 'activa'),
  (3, 3, 1, '2026-03-01', 'activa'),
  (4, 4, 1, '2026-03-01', 'activa'),
  (5, 5, 2, '2026-03-01', 'activa'),
  (6, 6, 2, '2026-03-01', 'activa'),
  (7, 7, 3, '2026-03-01', 'activa'),
  (8, 8, 3, '2026-03-01', 'activa')
ON DUPLICATE KEY UPDATE
  fecha_alta = VALUES(fecha_alta),
  estado = VALUES(estado);

INSERT INTO estado_asistencia (id_estado_asistencia, descripcion) VALUES
  (1, 'Presente'),
  (2, 'Ausente'),
  (3, 'Tarde'),
  (4, 'Justificada')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
