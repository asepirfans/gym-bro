# Workout sharing verification

- Browser fixture checks: 320, 375, 430, 768, 1024, 1440px; no horizontal overflow. Landscape 812×375 and reduced motion also checked.
- Actual downloaded PNG headers verified: 1080×1350, 1080×1920, 1080×1080. SVG text bounds remain inside each format. Transparent PNG corner alpha verified as zero.
- Four layouts and five palettes exercised; desktop/mobile editor, light/dark, and exported card screenshots inspected.
- Follow-up: list and combined layouts both show at most seven exercises. Seven- and nine-exercise fixtures verified in all three formats, including the remaining-count label and text bounds. Combined places the muscle map beside the list.
- Caption clipboard, hidden name in card/caption, correct session title, loading/retry, changed workout, Escape and native focus restoration verified.
- Export failure/retry, cancelled native share, denied clipboard/manual selection, and 200% page zoom verified. Narrow layouts wrap controls and footer actions.
- Native file share success/failure exercised with a browser stub. Unsupported file sharing exposes download instead. Real Android/iOS share sheets still need device verification.
- Palette muted text/background contrast: Oat 5.31:1, Clay 4.74:1, Olive 5.37:1, Night 7.96:1. Transparent white text requires a dark photo; the editor states this.
- Unit checks cover weighted and bodyweight totals, grouping by exercise ID, decimal commas, empty data, invalid weights, and safe PNG filenames. Full regression run: 14 pass, one database integration check skipped.

Tests use isolated server-action responses, with no writes to existing account data. Temporary preview routes are removed before production build.

Production build and standalone TypeScript check pass. The local production server runs on port 3002.
