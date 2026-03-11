# intenttext-builder

Online template builder shell for the IntentText PDF product track.

## Scope (current)

- Vite + React + TypeScript bootstrap
- Shared render API contract client
- Template editor + data JSON panel
- Validate and preview actions

## Contract

Builder preview must use the same render path as runtime package output.
Do not build a custom frontend-only renderer.

## Development

```bash
npm install
npm run dev
```

Run local render API (shared-contract endpoints):

```bash
npm run api
```

Or run both in one shell:

```bash
npm run dev:all
```

Default local render API base URL is controlled by `.env`:

```bash
VITE_RENDER_API_BASE_URL=http://localhost:8080/api
```

If not set, frontend defaults to same-origin `/api` (Vercel-friendly).

Optional override for core module path used by local API:

```bash
INTENTTEXT_CORE_PATH=/absolute/path/to/IntentText/packages/core/dist/index.js
```

## Vercel Deployment

This repo can run frontend + backend together on Vercel:

- Frontend: Vite static output
- Backend: Vercel Functions in `api/`

Implemented endpoints:

- `GET /api/health`
- `POST /api/validate-template`
- `POST /api/render-html`
- `POST /api/render-pdf`

## Next

- Variable inventory panel
- Artifact export/import UX
- Golden parity snapshot harness

## Golden Parity Harness

Run fixture parity checks (core render vs API render):

```bash
npm run parity:check
```

Fixture manifest:

- `fixtures/golden/manifest.json`

CI gate:

- `.github/workflows/ci.yml` runs `npm run build` and `npm run parity:check`

## PDF Runtime

Build runtime package once before using `/api/render-pdf` locally:

```bash
npm run pdf-runtime:build
```

Run PDF smoke check (API + runtime + puppeteer):

```bash
npm run pdf:smoke
```

Run deterministic HTML gate check:

```bash
npm run determinism:check
```

Run font policy gate check (no external font providers in render path):

```bash
npm run font-policy:check
```

Install `puppeteer` in `packages/pdf-runtime` before first PDF generation:

```bash
npm --prefix packages/pdf-runtime install puppeteer
```

Optional smoke artifact output:

```bash
PDF_SMOKE_WRITE=1 PDF_SMOKE_ARTIFACT_DIR=artifacts/pdf-smoke npm run pdf:smoke
```

## Contracts

- Template storage schema: `docs/TEMPLATE_STORAGE_SCHEMA.md`
- Validation API contract: `docs/VALIDATION_CONTRACT.md`
- Page layout contract (header/footer/background): `docs/PAGE_LAYOUT_CONTRACT.md`
- Runtime package skeleton: `docs/RUNTIME_PACKAGE_SKELETON.md`
- Font policy contract: `docs/FONT_POLICY.md`
