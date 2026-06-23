import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Save,
  School,
  UsersRound
} from "lucide-react";
import { api } from "./api";
import "./styles.css";

const today = new Date().toISOString().slice(0, 10);

const estadoClass = {
  Presente: "is-present",
  Ausente: "is-absent",
  Tarde: "is-late",
  Justificada: "is-justified"
};

function App() {
  const [health, setHealth] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [cursoId, setCursoId] = useState(1);
  const [fecha, setFecha] = useState(today);
  const [reporte, setReporte] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState("Certificado medico");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setLoading(true);
        const [healthData, userData, cursosData, estadosData] = await Promise.all([
          api.health(),
          api.login(),
          api.cursos(),
          api.estados()
        ]);

        if (cancelled) return;
        setHealth(healthData);
        setUsuario(userData);
        setCursos(cursosData);
        setEstados(estadosData);
        setCursoId(cursosData[0]?.idCurso || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cursoId || estados.length === 0) return;

    async function loadCurso() {
      try {
        setError("");
        const [alumnosData, asistenciasData, reporteData] = await Promise.all([
          api.alumnos(cursoId),
          api.asistencias(cursoId, fecha),
          api.reporteCurso(cursoId, fecha).catch(() => null)
        ]);

        const presente = estados.find((estado) => estado.descripcion === "Presente");
        const next = {};

        alumnosData.forEach((alumno) => {
          const asistencia = asistenciasData.find((item) => item.idMatricula === alumno.idMatricula);
          next[alumno.idMatricula] = {
            estadoId: asistencia?.idEstadoAsistencia || presente?.idEstadoAsistencia || 1,
            observacion: asistencia?.observacion || "",
            idAsistencia: asistencia?.idAsistencia || null,
            motivoJustificativo: asistencia?.motivoJustificativo || ""
          };
        });

        setAlumnos(alumnosData);
        setAsistencias(next);
        setReporte(reporteData);
        setSeleccionado(alumnosData[0] || null);
      } catch (err) {
        setError(err.message);
      }
    }

    loadCurso();
  }, [cursoId, fecha, estados]);

  const curso = cursos.find((item) => Number(item.idCurso) === Number(cursoId));

  const totals = useMemo(() => {
    const byId = Object.values(asistencias).reduce((acc, asistencia) => {
      acc[asistencia.estadoId] = (acc[asistencia.estadoId] || 0) + 1;
      return acc;
    }, {});

    return estados.map((estado) => ({
      ...estado,
      total: byId[estado.idEstadoAsistencia] || 0
    }));
  }, [asistencias, estados]);

  function updateEstado(idMatricula, estadoId) {
    setAsistencias((current) => ({
      ...current,
      [idMatricula]: {
        ...current[idMatricula],
        estadoId
      }
    }));
  }

  async function guardar() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        cursoId: Number(cursoId),
        fecha,
        usuarioId: usuario.idUsuario,
        asistencias: alumnos.map((alumno) => ({
          matriculaId: alumno.idMatricula,
          estadoId: asistencias[alumno.idMatricula].estadoId,
          observacion: asistencias[alumno.idMatricula].observacion || null
        }))
      };

      await api.guardarAsistencias(payload);
      const [actualizadas, reporteActualizado] = await Promise.all([
        api.asistencias(cursoId, fecha),
        api.reporteCurso(cursoId, fecha)
      ]);

      const next = { ...asistencias };
      actualizadas.forEach((item) => {
        next[item.idMatricula] = {
          ...next[item.idMatricula],
          idAsistencia: item.idAsistencia,
          motivoJustificativo: item.motivoJustificativo || ""
        };
      });

      setAsistencias(next);
      setReporte(reporteActualizado);
      setMessage("Asistencia guardada correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function guardarJustificativo() {
    if (!seleccionado) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      let asistenciaId = asistencias[seleccionado.idMatricula]?.idAsistencia;

      if (!asistenciaId) {
        await guardar();
        const actualizadas = await api.asistencias(cursoId, fecha);
        asistenciaId = actualizadas.find((item) => item.idMatricula === seleccionado.idMatricula)?.idAsistencia;
      }

      await api.guardarJustificativo({
        asistenciaId,
        fechaPresentacion: fecha,
        motivo,
        comprobante: "carga desde demo",
        estado: "aceptado",
        usuarioId: usuario.idUsuario
      });

      setMessage(`Justificativo guardado para ${seleccionado.apellido}, ${seleccionado.nombre}.`);
      const reporteActualizado = await api.reporteCurso(cursoId, fecha);
      setReporte(reporteActualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <Loader2 className="spin" size={30} />
        <span>Conectando con la API de asistencia...</span>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <School size={28} />
          <div>
            <strong>Asistencia Escolar</strong>
            <span>Demo TP</span>
          </div>
        </div>

        <nav>
          <a className="active"><ClipboardList size={18} /> Registro</a>
          <a><BarChart3 size={18} /> Reportes</a>
          <a><UsersRound size={18} /> Alumnos</a>
        </nav>

        <div className="system-status">
          <CheckCircle2 size={18} />
          <div>
            <strong>API {health?.database === "ok" ? "online" : "sin conexion"}</strong>
            <span>{api.apiUrl}</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>Registro diario</p>
            <h1>Sistema de Asistencia Escolar</h1>
          </div>
          <div className="user-chip">
            <GraduationCap size={18} />
            <span>{usuario?.rol?.nombreRol || "Preceptor"} demo</span>
          </div>
        </header>

        {error && <div className="notice error">{error}</div>}
        {message && <div className="notice success">{message}</div>}

        <section className="controls-band">
          <label>
            Curso
            <select value={cursoId} onChange={(event) => setCursoId(event.target.value)}>
              {cursos.map((item) => (
                <option key={item.idCurso} value={item.idCurso}>
                  {item.anio}° {item.division} - {item.turno} ({item.cicloLectivo})
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          </label>
          <button onClick={guardar} disabled={saving || alumnos.length === 0}>
            {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
            Guardar asistencia
          </button>
        </section>

        <section className="content-grid">
          <section className="attendance-panel">
            <div className="panel-heading">
              <div>
                <p>Curso seleccionado</p>
                <h2>{curso ? `${curso.anio}° ${curso.division}` : "Sin curso"}</h2>
              </div>
              <span><CalendarDays size={16} /> {fecha}</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>DNI</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno) => {
                    const actual = asistencias[alumno.idMatricula]?.estadoId;
                    return (
                      <tr
                        key={alumno.idMatricula}
                        className={seleccionado?.idMatricula === alumno.idMatricula ? "selected" : ""}
                        onClick={() => setSeleccionado(alumno)}
                      >
                        <td>
                          <strong>{alumno.apellido}, {alumno.nombre}</strong>
                          <span>Matricula #{alumno.idMatricula}</span>
                        </td>
                        <td>{alumno.dni}</td>
                        <td>
                          <div className="segmented">
                            {estados.map((estado) => (
                              <button
                                key={estado.idEstadoAsistencia}
                                className={actual === estado.idEstadoAsistencia ? estadoClass[estado.descripcion] : ""}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  updateEstado(alumno.idMatricula, estado.idEstadoAsistencia);
                                }}
                              >
                                {estado.descripcion}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="summary-panel">
            <section>
              <div className="panel-heading compact">
                <div>
                  <p>Resumen</p>
                  <h2>Totales del dia</h2>
                </div>
              </div>
              <div className="stats">
                {totals.map((item) => (
                  <div key={item.idEstadoAsistencia} className={estadoClass[item.descripcion]}>
                    <span>{item.descripcion}</span>
                    <strong>{item.total}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="justification-box">
              <div className="panel-heading compact">
                <div>
                  <p>Justificativo</p>
                  <h2>{seleccionado ? `${seleccionado.apellido}, ${seleccionado.nombre}` : "Seleccionar alumno"}</h2>
                </div>
                <FileText size={18} />
              </div>
              <textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Motivo del justificativo"
              />
              <button onClick={guardarJustificativo} disabled={!seleccionado || saving}>
                Guardar justificativo
              </button>
            </section>

            <section className="report-box">
              <div className="panel-heading compact">
                <div>
                  <p>Reporte</p>
                  <h2>Salida administrativa</h2>
                </div>
              </div>
              <ul>
                {(reporte?.totales || totals).map((item) => (
                  <li key={item.estado || item.descripcion}>
                    <span>{item.estado || item.descripcion}</span>
                    <strong>{item.total}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
