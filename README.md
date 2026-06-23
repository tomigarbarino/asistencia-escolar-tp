# Sistema de Gestion de Asistencia Escolar

TP de sistema web para registrar asistencia escolar con backend, MySQL dockerizado y frontend de presentacion.

## Objetivo

Permitir que preceptores o docentes registren la asistencia diaria de alumnos, carguen justificativos y consulten reportes por curso, alumno o fecha.

## Stack propuesto

- Backend: Node.js + Express.
- Base de datos: MySQL en Docker.
- Administracion de base: phpMyAdmin.
- Frontend: React/Vite en una etapa posterior.

## Flujo de demo

1. Seleccionar usuario/rol de prueba.
2. Seleccionar curso y fecha.
3. Marcar asistencia de los alumnos.
4. Cargar justificativo cuando corresponda.
5. Guardar asistencia.
6. Consultar reporte del curso.

## Tickets publicos

El trabajo esta bajado a issues del repositorio:

- #1 Inicializar repositorio y estructura del proyecto.
- #2 Configurar MySQL dockerizado y phpMyAdmin.
- #3 Crear schema SQL y datos iniciales.
- #4 Implementar backend Express y conexion a MySQL.
- #5 Crear endpoints de cursos, alumnos y asistencia.
- #6 Crear carga de justificativos.
- #7 Crear reportes de asistencia.
- #8 Construir frontend de presentacion.
- #9 Preparar QA y guion de presentacion.

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

## API inicial

La API permite probar el flujo principal antes de construir el frontend:

- Login demo.
- Consulta de cursos.
- Consulta de alumnos por curso.
- Registro de asistencia por curso y fecha.
- Carga de justificativos.
- Reportes por curso y alumno.

Ver ejemplos en `docs/api-ejemplos.md`.

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
