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

Default local render API base URL is controlled by `.env`:

```bash
VITE_RENDER_API_BASE_URL=http://localhost:8080
```

## Next

- Variable inventory panel
- Artifact export/import UX
- Golden parity snapshot harness
