# Project Context Summary (v2) - 2026-01-28

## Status Update
- **Fixed Runtime Error**: Resolved `Expected <div> to have explicit "display: flex"` in `TrendProgress` component by adding explicit flex styles and restoring component structure.
- **Refactoring**: Extracted Satori templates into dedicated components:
  - `src/components/satori/TrendProgress.tsx` (corresponds to Figma node 186-1179)
  - `src/components/satori/DiagnosisBarChart.tsx`
- **Image Handling**: Updated `satori-assets.tsx` to load `public/figma/fire.png` as Base64 Data URL to resolve build/runtime path issues.

## Current Architecture
- **Satori Assets**: `src/lib/satori-assets.tsx` now acts as a controller, loading data/fonts and rendering React components to SVG/PNG.
- **Components**:
  - `TrendProgress`: Flexbox-based layout with strict Satori compliance. Uses absolute positioning for the fire icon overlay.
  - `DiagnosisBarChart`: Bar chart visualization.

## Pending Items
- **Figma Node 186-2485**: "Bottom button jump image" needs to be implemented/verified. Currently only `TrendProgress` and `DiagnosisBarChart` exist.
- **Vercel Blob**: Upload logic is ready for testing with `forceBase64` toggle available for debugging.

## Known Issues & Fixes
- **Webpack .node files**: Fixed via `next.config.mjs` externals.
- **Satori Flexbox**: Fixed via explicit `display: flex` on all container divs.
