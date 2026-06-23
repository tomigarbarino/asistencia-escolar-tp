CREATE DATABASE IF NOT EXISTS asistencia_escolar
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE asistencia_escolar;

CREATE TABLE IF NOT EXISTS rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(80) NOT NULL UNIQUE,
  clave VARCHAR(120) NOT NULL,
  id_rol INT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE IF NOT EXISTS alumno (
  id_alumno INT AUTO_INCREMENT PRIMARY KEY,
  dni INT NOT NULL UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  domicilio VARCHAR(160) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS tutor (
  id_tutor INT AUTO_INCREMENT PRIMARY KEY,
  dni INT NOT NULL UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  email VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumno_tutor (
  id_alumno_tutor INT AUTO_INCREMENT PRIMARY KEY,
  id_alumno INT NOT NULL,
  id_tutor INT NOT NULL,
  parentesco VARCHAR(40) NOT NULL,
  CONSTRAINT uq_alumno_tutor UNIQUE (id_alumno, id_tutor),
  CONSTRAINT fk_alumno_tutor_alumno
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
  CONSTRAINT fk_alumno_tutor_tutor
    FOREIGN KEY (id_tutor) REFERENCES tutor(id_tutor)
);

CREATE TABLE IF NOT EXISTS curso (
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  anio TINYINT NOT NULL,
  division VARCHAR(5) NOT NULL,
  turno VARCHAR(30) NOT NULL,
  ciclo_lectivo INT NOT NULL,
  CONSTRAINT uq_curso UNIQUE (anio, division, turno, ciclo_lectivo)
);

CREATE TABLE IF NOT EXISTS matricula (
  id_matricula INT AUTO_INCREMENT PRIMARY KEY,
  id_alumno INT NOT NULL,
  id_curso INT NOT NULL,
  fecha_alta DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activa',
  CONSTRAINT uq_matricula UNIQUE (id_alumno, id_curso),
  CONSTRAINT fk_matricula_alumno
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
  CONSTRAINT fk_matricula_curso
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

CREATE TABLE IF NOT EXISTS estado_asistencia (
  id_estado_asistencia INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS asistencia (
  id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
  id_matricula INT NOT NULL,
  fecha DATE NOT NULL,
  id_estado_asistencia INT NOT NULL,
  observacion VARCHAR(255) NULL,
  id_usuario INT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_asistencia_matricula_fecha UNIQUE (id_matricula, fecha),
  CONSTRAINT fk_asistencia_matricula
    FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),
  CONSTRAINT fk_asistencia_estado
    FOREIGN KEY (id_estado_asistencia) REFERENCES estado_asistencia(id_estado_asistencia),
  CONSTRAINT fk_asistencia_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS justificativo (
  id_justificativo INT AUTO_INCREMENT PRIMARY KEY,
  id_asistencia INT NOT NULL UNIQUE,
  fecha_presentacion DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  comprobante VARCHAR(120) NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  id_usuario INT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_justificativo_asistencia
    FOREIGN KEY (id_asistencia) REFERENCES asistencia(id_asistencia),
  CONSTRAINT fk_justificativo_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
