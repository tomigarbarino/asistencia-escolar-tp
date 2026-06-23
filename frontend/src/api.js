const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la operacion");
  }

  return data;
}

export const api = {
  apiUrl: API_URL,
  health: () => request("/api/health"),
  login: () => request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ nombreUsuario: "preceptor.demo", clave: "demo123" })
  }),
  cursos: () => request("/api/cursos"),
  alumnos: (cursoId) => request(`/api/cursos/${cursoId}/alumnos`),
  estados: () => request("/api/estados-asistencia"),
  asistencias: (cursoId, fecha) => request(`/api/asistencias?cursoId=${cursoId}&fecha=${fecha}`),
  guardarAsistencias: (payload) => request("/api/asistencias", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  guardarJustificativo: (payload) => request("/api/justificativos", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  reporteCurso: (cursoId, fecha) => request(`/api/reportes/curso/${cursoId}?fecha=${fecha}`)
};
