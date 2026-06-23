# Backend

API REST para el TP de gestion de asistencia escolar.

## Scripts

```bash
npm install
npm run dev
```

## Endpoints principales

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/cursos`
- `GET /api/cursos/:id/alumnos`
- `GET /api/estados-asistencia`
- `GET /api/asistencias?cursoId=1&fecha=2026-06-23`
- `POST /api/asistencias`
- `POST /api/justificativos`
- `GET /api/reportes/curso/:cursoId?fecha=2026-06-23`
- `GET /api/reportes/alumno/:alumnoId`
