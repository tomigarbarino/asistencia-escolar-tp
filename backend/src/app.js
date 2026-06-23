const express = require("express");
const cors = require("cors");
const { config } = require("./config");
const { pool, pingDatabase } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");
  if (missing.length > 0) {
    const error = new Error(`Faltan campos obligatorios: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

app.get("/api/health", asyncHandler(async (_req, res) => {
  const database = await pingDatabase();
  res.json({
    ok: true,
    service: "asistencia-escolar-backend",
    database
  });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  requireFields(req.body, ["nombreUsuario", "clave"]);

  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.nombre_usuario, u.estado, r.id_rol, r.nombre_rol
     FROM usuario u
     INNER JOIN rol r ON r.id_rol = u.id_rol
     WHERE u.nombre_usuario = ? AND u.clave = ? AND u.estado = 'activo'`,
    [req.body.nombreUsuario, req.body.clave]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Usuario o clave incorrectos" });
  }

  const user = rows[0];
  res.json({
    idUsuario: user.id_usuario,
    nombreUsuario: user.nombre_usuario,
    rol: {
      idRol: user.id_rol,
      nombreRol: user.nombre_rol
    }
  });
}));

app.get("/api/cursos", asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT id_curso AS idCurso, anio, division, turno, ciclo_lectivo AS cicloLectivo
     FROM curso
     ORDER BY ciclo_lectivo DESC, anio ASC, division ASC`
  );

  res.json(rows);
}));

app.get("/api/cursos/:id/alumnos", asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
       m.id_matricula AS idMatricula,
       a.id_alumno AS idAlumno,
       a.dni,
       a.nombre,
       a.apellido,
       m.estado AS estadoMatricula
     FROM matricula m
     INNER JOIN alumno a ON a.id_alumno = m.id_alumno
     WHERE m.id_curso = ? AND m.estado = 'activa'
     ORDER BY a.apellido ASC, a.nombre ASC`,
    [req.params.id]
  );

  res.json(rows);
}));

app.get("/api/estados-asistencia", asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT id_estado_asistencia AS idEstadoAsistencia, descripcion
     FROM estado_asistencia
     ORDER BY id_estado_asistencia ASC`
  );

  res.json(rows);
}));

app.get("/api/asistencias", asyncHandler(async (req, res) => {
  const { cursoId, fecha } = req.query;
  if (!cursoId || !fecha) {
    return res.status(400).json({ error: "Los parametros cursoId y fecha son obligatorios" });
  }

  const [rows] = await pool.execute(
    `SELECT
       m.id_matricula AS idMatricula,
       a.id_alumno AS idAlumno,
       a.apellido,
       a.nombre,
       asi.id_asistencia AS idAsistencia,
       asi.fecha,
       asi.observacion,
       ea.id_estado_asistencia AS idEstadoAsistencia,
       ea.descripcion AS estadoAsistencia,
       j.id_justificativo AS idJustificativo,
       j.motivo AS motivoJustificativo,
       j.estado AS estadoJustificativo
     FROM matricula m
     INNER JOIN alumno a ON a.id_alumno = m.id_alumno
     LEFT JOIN asistencia asi
       ON asi.id_matricula = m.id_matricula
      AND asi.fecha = ?
     LEFT JOIN estado_asistencia ea
       ON ea.id_estado_asistencia = asi.id_estado_asistencia
     LEFT JOIN justificativo j
       ON j.id_asistencia = asi.id_asistencia
     WHERE m.id_curso = ? AND m.estado = 'activa'
     ORDER BY a.apellido ASC, a.nombre ASC`,
    [fecha, cursoId]
  );

  res.json(rows);
}));

app.post("/api/asistencias", asyncHandler(async (req, res) => {
  requireFields(req.body, ["cursoId", "fecha", "usuarioId", "asistencias"]);

  if (!Array.isArray(req.body.asistencias) || req.body.asistencias.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos una asistencia" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const guardadas = [];

    for (const item of req.body.asistencias) {
      if (!item.matriculaId || !item.estadoId) {
        const error = new Error("Cada asistencia debe incluir matriculaId y estadoId");
        error.status = 400;
        throw error;
      }

      const [matriculaRows] = await connection.execute(
        `SELECT id_matricula
         FROM matricula
         WHERE id_matricula = ? AND id_curso = ? AND estado = 'activa'`,
        [item.matriculaId, req.body.cursoId]
      );

      if (matriculaRows.length === 0) {
        const error = new Error(`La matricula ${item.matriculaId} no pertenece al curso indicado`);
        error.status = 400;
        throw error;
      }

      await connection.execute(
        `INSERT INTO asistencia
          (id_matricula, fecha, id_estado_asistencia, observacion, id_usuario)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          id_estado_asistencia = VALUES(id_estado_asistencia),
          observacion = VALUES(observacion),
          id_usuario = VALUES(id_usuario)`,
        [
          item.matriculaId,
          req.body.fecha,
          item.estadoId,
          item.observacion || null,
          req.body.usuarioId
        ]
      );

      const [asistenciaRows] = await connection.execute(
        `SELECT id_asistencia AS idAsistencia
         FROM asistencia
         WHERE id_matricula = ? AND fecha = ?`,
        [item.matriculaId, req.body.fecha]
      );

      guardadas.push({
        matriculaId: item.matriculaId,
        idAsistencia: asistenciaRows[0].idAsistencia
      });
    }

    await connection.commit();
    res.status(201).json({ guardadas });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.post("/api/justificativos", asyncHandler(async (req, res) => {
  requireFields(req.body, ["asistenciaId", "fechaPresentacion", "motivo", "estado", "usuarioId"]);

  const [asistenciaRows] = await pool.execute(
    `SELECT id_asistencia
     FROM asistencia
     WHERE id_asistencia = ?`,
    [req.body.asistenciaId]
  );

  if (asistenciaRows.length === 0) {
    return res.status(404).json({ error: "No existe la asistencia indicada" });
  }

  await pool.execute(
    `INSERT INTO justificativo
      (id_asistencia, fecha_presentacion, motivo, comprobante, estado, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      fecha_presentacion = VALUES(fecha_presentacion),
      motivo = VALUES(motivo),
      comprobante = VALUES(comprobante),
      estado = VALUES(estado),
      id_usuario = VALUES(id_usuario)`,
    [
      req.body.asistenciaId,
      req.body.fechaPresentacion,
      req.body.motivo,
      req.body.comprobante || null,
      req.body.estado,
      req.body.usuarioId
    ]
  );

  const [rows] = await pool.execute(
    `SELECT
       id_justificativo AS idJustificativo,
       id_asistencia AS idAsistencia,
       fecha_presentacion AS fechaPresentacion,
       motivo,
       comprobante,
       estado,
       id_usuario AS idUsuario
     FROM justificativo
     WHERE id_asistencia = ?`,
    [req.body.asistenciaId]
  );

  res.status(201).json(rows[0]);
}));

app.get("/api/reportes/curso/:cursoId", asyncHandler(async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) {
    return res.status(400).json({ error: "El parametro fecha es obligatorio" });
  }

  const [cursoRows] = await pool.execute(
    `SELECT id_curso AS idCurso, anio, division, turno, ciclo_lectivo AS cicloLectivo
     FROM curso
     WHERE id_curso = ?`,
    [req.params.cursoId]
  );

  if (cursoRows.length === 0) {
    return res.status(404).json({ error: "Curso no encontrado" });
  }

  const [totales] = await pool.execute(
    `SELECT
       ea.descripcion AS estado,
       COUNT(asi.id_asistencia) AS total
     FROM estado_asistencia ea
     LEFT JOIN asistencia asi
       ON asi.id_estado_asistencia = ea.id_estado_asistencia
      AND asi.fecha = ?
      AND asi.id_matricula IN (
        SELECT id_matricula FROM matricula WHERE id_curso = ?
      )
     GROUP BY ea.id_estado_asistencia, ea.descripcion
     ORDER BY ea.id_estado_asistencia ASC`,
    [fecha, req.params.cursoId]
  );

  const [detalle] = await pool.execute(
    `SELECT
       a.id_alumno AS idAlumno,
       a.apellido,
       a.nombre,
       ea.descripcion AS estado,
       asi.observacion,
       j.motivo AS motivoJustificativo
     FROM matricula m
     INNER JOIN alumno a ON a.id_alumno = m.id_alumno
     LEFT JOIN asistencia asi
       ON asi.id_matricula = m.id_matricula
      AND asi.fecha = ?
     LEFT JOIN estado_asistencia ea
       ON ea.id_estado_asistencia = asi.id_estado_asistencia
     LEFT JOIN justificativo j
       ON j.id_asistencia = asi.id_asistencia
     WHERE m.id_curso = ? AND m.estado = 'activa'
     ORDER BY a.apellido ASC, a.nombre ASC`,
    [fecha, req.params.cursoId]
  );

  res.json({
    curso: cursoRows[0],
    fecha,
    totales,
    detalle
  });
}));

app.get("/api/reportes/alumno/:alumnoId", asyncHandler(async (req, res) => {
  const [alumnoRows] = await pool.execute(
    `SELECT id_alumno AS idAlumno, dni, nombre, apellido
     FROM alumno
     WHERE id_alumno = ?`,
    [req.params.alumnoId]
  );

  if (alumnoRows.length === 0) {
    return res.status(404).json({ error: "Alumno no encontrado" });
  }

  const [historial] = await pool.execute(
    `SELECT
       asi.id_asistencia AS idAsistencia,
       asi.fecha,
       c.anio,
       c.division,
       c.turno,
       ea.descripcion AS estado,
       asi.observacion,
       j.motivo AS motivoJustificativo,
       j.estado AS estadoJustificativo
     FROM asistencia asi
     INNER JOIN matricula m ON m.id_matricula = asi.id_matricula
     INNER JOIN curso c ON c.id_curso = m.id_curso
     INNER JOIN estado_asistencia ea ON ea.id_estado_asistencia = asi.id_estado_asistencia
     LEFT JOIN justificativo j ON j.id_asistencia = asi.id_asistencia
     WHERE m.id_alumno = ?
     ORDER BY asi.fecha DESC`,
    [req.params.alumnoId]
  );

  res.json({
    alumno: alumnoRows[0],
    historial
  });
}));

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "Error interno del servidor"
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`API de asistencia escolar escuchando en puerto ${config.port}`);
  });
}

module.exports = app;
