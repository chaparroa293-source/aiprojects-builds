# Obras

Gestión de obras para un estudio de ingeniería/arquitectura (Paraguay, guaraníes).

## Documentación

### Mapa de autoridad

- **Actual — [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md):** semántica de
  producto y dominio vigente: objetos, relaciones, invariantes, captura,
  recuperación, derivaciones y acceso. Es el documento de cambio lento.
- **Ejecutable — `prisma/schema.prisma`, `prisma/migrations/`, `app/` y
  `lib/`:** implementación y persistencia reales. Ante una discrepancia,
  investigar y reconciliar el spec; no inventar una tercera fuente.
- **UX actual en revisión —
  [docs/UX_UI_REFINEMENT_SPEC.md](docs/UX_UI_REFINEMENT_SPEC.md):** contrato
  recomendado para trabajo UX/UI posterior; no cambia dominio ni autoriza
  implementación hasta aprobar el slice.
- **Slices — [specs/](specs/):** contratos acotados de cambio. Los documentos
  completados y `specs/v1/` son historial de decisiones, no verdad actual.
- **Evidencia de verificación — [docs/SCENARIO_TESTS.md](docs/SCENARIO_TESTS.md)
  y [docs/SCENARIO_TEST_RESULTS.md](docs/SCENARIO_TEST_RESULTS.md):** diseño
  de pruebas y ejecuciones registradas; no sustituyen el spec ni el código.
- **Histórico:** Git conserva commits; los handoffs, planes originales y
  feedback de rondas anteriores explican decisiones pasadas sin gobernar el
  comportamiento actual.

## Estado

Implementado: directorio (Clientes / Proveedores / Personal), Proyectos,
árbol de Segmentos, captura de Gastos, revisiones de precio, historial de
proyectos, búsqueda global. Pendiente: Pedidos, Notas, Adjuntos.

## Stack

Next.js (App Router) + Prisma + Postgres (Neon en producción). Una sola
firma (`firm_id` en todas las tablas). El acceso es una sola contraseña
compartida: una cookie firmada y temporal protege toda la aplicación, sin
cuentas, roles, identidad ni atribución por persona. No hay alta pública.

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

## Despliegue

Vercel + Neon Postgres. El script de build actual corre
`prisma migrate deploy && next build`. La generación explícita de Prisma se
ejecuta en `npm run verify`, antes del build de CI.

**Preview aislado de Production (OBRAS-013).** Cada Preview deployment
usa su propia rama de Neon (copy-on-write del esquema y los datos de
Production al momento de crearse), no la base de Production. Se
configura una sola vez desde el tab Storage del proyecto en Vercel →
la base de Neon → "Connect" → en la configuración de despliegues,
"Create a database branch for deployment" = Preview. El `DATABASE_URL`
de esa rama se inyecta por deployment (no aparece como valor fijo en
Environment Variables) y la rama se borra sola cuando Vercel borra el
deployment de Preview correspondiente.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:up` / `db:down` | Postgres local vía Docker |
| `npm run db:local` / `db:local:stop` | Postgres local sin Docker (binario embebido) |
| `npm run db:seed` | Carga registros de ejemplo |
| `npm run lint` / `typecheck` | Chequeos |
| `npm run verify` | Lint, typecheck, `prisma generate` y build sin migrar |
