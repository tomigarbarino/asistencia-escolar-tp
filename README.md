# Sistema de Gestion de Asistencia Escolar

TP de sistema web para registrar asistencia escolar con backend, MySQL dockerizado y frontend de presentacion.

## Objetivo

Permitir que preceptores o docentes registren la asistencia diaria de alumnos, carguen justificativos y consulten reportes por curso, alumno o fecha.

## Stack propuesto

- Backend: Node.js + Express.
- Base de datos: MySQL en Docker.
- Administracion de base: phpMyAdmin.
- Frontend: React/Vite.

## Flujo de demo

1. Seleccionar usuario/rol de prueba.
2. Seleccionar curso y fecha.
3. Marcar asistencia de los alumnos.
4. Cargar justificativo cuando corresponda.
5. Guardar asistencia.
6. Consultar reporte del curso.

## Ejecucion local

Requisitos:

- Node.js 20 o superior.
- Docker Desktop o Docker Engine con Compose.

Copiar el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

Levantar servicios:

```bash
docker compose up --build
```

URLs esperadas:

- Backend: http://localhost:3000
- Healthcheck: http://localhost:3000/api/health
- phpMyAdmin: http://localhost:8080
- Frontend: http://localhost:5173

## API inicial

La API permite probar el flujo principal antes de construir el frontend:

- Login demo.
- Consulta de cursos.
- Consulta de alumnos por curso.
- Registro de asistencia por curso y fecha.
- Carga de justificativos.
- Reportes por curso y alumno.

Ver ejemplos en `docs/api-ejemplos.md`.

## Demo tipo produccion

Arquitectura recomendada:

```txt
Frontend en Vercel -> Backend Express en Railway -> MySQL en Railway
```

Alternativa si Railway no esta disponible:

```txt
Frontend en Vercel -> Backend Express en Northflank -> MySQL en Northflank
```

Northflank permite crear un servicio Node/Express y un addon MySQL en el mismo proyecto. Para este repo se mantiene el mismo backend y solo hay que configurar las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` con los datos del addon MySQL.

Referencias:

- Node/Express en Northflank: https://northflank.com/stacks/deploy-node-express
- MySQL en Northflank: https://northflank.com/docs/v1/application/databases-and-persistence/deploy-databases-on-northflank/deploy-mysql-on-northflank

Backend en Railway:

- Root directory: `backend`
- Start command: `npm start`
- Healthcheck: `/api/health`
- Variables de base soportadas: `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

Frontend en Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variable requerida: `VITE_API_URL=https://url-del-backend`

## Alcance

Incluye:

- Usuarios y roles.
- Cursos y alumnos.
- Matriculas.
- Estados de asistencia.
- Registro diario de asistencia.
- Justificativos.
- Reportes simples.

No incluye:

- Calificaciones.
- Boletines.
- Pagos.
- Biblioteca.
- Transporte.
- Liquidacion de sueldos.
- Comunicacion automatica por WhatsApp, email o SMS.
