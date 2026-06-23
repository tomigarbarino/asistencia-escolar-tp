# Ejemplos de API

Base local:

```bash
http://localhost:3000
```

## Healthcheck

```bash
curl http://localhost:3000/api/health
```

## Login demo

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"nombreUsuario\":\"preceptor.demo\",\"clave\":\"demo123\"}"
```

## Listar cursos

```bash
curl http://localhost:3000/api/cursos
```

## Listar alumnos de un curso

```bash
curl http://localhost:3000/api/cursos/1/alumnos
```

## Listar estados de asistencia

```bash
curl http://localhost:3000/api/estados-asistencia
```

## Guardar asistencia

```bash
curl -X POST http://localhost:3000/api/asistencias \
  -H "Content-Type: application/json" \
  -d "{\"cursoId\":1,\"fecha\":\"2026-06-23\",\"usuarioId\":1,\"asistencias\":[{\"matriculaId\":1,\"estadoId\":1},{\"matriculaId\":2,\"estadoId\":2,\"observacion\":\"No asistio a primera hora\"},{\"matriculaId\":3,\"estadoId\":3},{\"matriculaId\":4,\"estadoId\":1}]}"
```

## Cargar justificativo

Usar un `idAsistencia` devuelto por el guardado anterior.

```bash
curl -X POST http://localhost:3000/api/justificativos \
  -H "Content-Type: application/json" \
  -d "{\"asistenciaId\":2,\"fechaPresentacion\":\"2026-06-23\",\"motivo\":\"Certificado medico\",\"comprobante\":\"certificado.pdf\",\"estado\":\"aceptado\",\"usuarioId\":1}"
```

## Reporte por curso y fecha

```bash
curl "http://localhost:3000/api/reportes/curso/1?fecha=2026-06-23"
```

## Reporte por alumno

```bash
curl http://localhost:3000/api/reportes/alumno/1
```
