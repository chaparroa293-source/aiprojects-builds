# Obras

Gestión de obras para un estudio de ingeniería/arquitectura (Paraguay, guaraníes).

## Documentación

- **[TECHNICAL_SPEC.md](TECHNICAL_SPEC.md)** — la verdad de dominio vigente:
  qué objetos existen, qué garantiza el sistema, cómo se captura y se
  recupera cada cosa, qué se deriva. Documento de cambio lento (ver su
  propio encabezado para cuándo actualizarlo).
- **[specs/](specs/)** — documentación por slice (`context.md` / `spec.md`
  / `plan.md`). `specs/v1/` tiene los documentos de planificación
  originales del producto.

## Estado

Implementado: directorio (Clientes / Proveedores / Personal), Proyectos,
árbol de Segmentos, captura de Gastos, revisiones de precio, historial de
proyectos, búsqueda global. Pendiente: Pedidos, Notas, Adjuntos.

## Stack

Next.js (App Router) + Prisma + Postgres. Una sola firma (`firm_id` en
todas las tablas). Sin autenticación.

## Desarrollo local

Requisitos: Node ≥ 20.9. Postgres por una de dos vías:

**Con Docker:**
```bash
npm install
npm run db:up                 # Postgres en localhost:5433 (docker-compose.yml)
```

**Sin Docker** (binario Postgres embebido, se descarga la primera vez):
```bash
npm install
npm run db:local              # deja Postgres en primer plano en localhost:5433
# en otra terminal, seguir abajo. Para detener: npm run db:local:stop
```

Luego, en cualquier caso:
```bash
npx prisma migrate deploy     # aplica migraciones (o `migrate dev` al cambiar el esquema)
npm run db:seed               # datos de ejemplo (opcional)
npm run dev                   # http://localhost:3000 (o 3001 si 3000 está ocupado)
```

Otra opción: apuntar `DATABASE_URL` a cualquier Postgres propio.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:up` / `db:down` | Postgres local vía Docker |
| `npm run db:local` / `db:local:stop` | Postgres local sin Docker (binario embebido) |
| `npm run db:seed` | Carga registros de ejemplo |
| `npm run lint` / `typecheck` | Chequeos |
