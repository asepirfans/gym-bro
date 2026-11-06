# Workout sharing: 3D anatomy

Heatmap and combined cards use a real local glTF anatomy model. The list and radar layouts do not load Three.js or the model. The editor has drag rotation, a keyboard-accessible angle slider, front/back presets, and optional automatic rotation. Pause rotation to freeze the pose for export. Reduced-motion changes and hidden tabs stop automatic rotation; closing the dialog releases the renderer and its WebGL context.

The viewer renders on demand when stationary. Automatic rotation is capped around 25fps, with no shadows or full-screen postprocessing. Heatmap shows opposite sides; combined uses one figure beside the existing maximum of seven exercise rows. Muscle colors use the workout's set counts, including bodyweight sets. Unmapped structures remain neutral.

The scene is rendered to a transparent PNG and embedded directly in the card SVG. Card export uses that same image and waits for a settled pose. This preserves the selected angle, lighting, palette, and alpha without a second render or cross-origin assets. Export stays disabled while a model is loading or rotating. Model/context failures use the original 2D figure and expose a retry button. The file-sharing behavior and image formats remain unchanged.

## Model and attribution

- Source: [Écorché / Charleeh](https://github.com/Charleeh/ecorche), derived from BodyParts3D / DBCLS and Z-Anatomy / Gauthier Kervyn, with the upstream BodyExplorer export credited in the supplied attribution file.
- License: CC BY-SA 4.0. Adapted meshes and anatomy renders keep that license. Attribution and a source/license line are included in captions that accompany the 3D render. The user requested clean card images and editor controls without embedded credit text or a visible source link. Full license and source notices remain served in `public/models/`.
- Adaptations: removed the deep-muscle layer, removed vertex colors, grouped surfaces into six workout regions plus bone/neutral, simplified geometry and applied meshopt compression.
- Delivered asset: 1,048,344 bytes; 166,023 triangles; eight draw primitives per figure. The paired view draws two figures. Source file: 6,004,016 bytes with 984,688 triangles.
- Checksums and machine-readable counts: `public/models/anatomy-manifest.json`.

## Rebuild the model

From the repository root, with Node supporting `--experimental-strip-types`:

```powershell
New-Item -ItemType Directory -Force artifacts/anatomy/tools | Out-Null
Invoke-WebRequest https://raw.githubusercontent.com/Charleeh/ecorche/main/model/ecorche.meshopt.glb -OutFile artifacts/anatomy/source.glb
npm install --prefix artifacts/anatomy/tools --no-save @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 @gltf-transform/functions@4.5.1 meshoptimizer@1.3.0
node --experimental-strip-types scripts/prepare-anatomy.mjs
```

The preparation script checks the source checksum before transforming it. Build-only transformation packages stay in ignored artifacts; deployed code only needs Three.js. A changed source requires checking its license and updating the pinned checksum deliberately.

## Verification

The Progress page reuses the same viewer in its muscle-group tab, with heat based on its existing volume totals. Its viewer renders square frames for a larger mobile figure and skips PNG snapshot generation. Volume/repetition rows remain available below it. Tab switching unmounts the renderer; WebGL failure falls back to the existing 2D progress visualization with a retry control. The theme accent follows dark/light changes.

The share editor omits the requested idle helper sentence, visible source link, set/bodyweight explanation, and idle PNG-ready message. Loading, error, retry, and active-rotation messages remain functional.

Progress follow-up checks pass for six responsive widths, light/dark theme changes, actual 3D volume display, two concurrent viewers with unique angle controls, zero PNG snapshots in progress mode, context-loss fallback/retry, and tab cleanup. Requested share copy is absent. Production build, TypeScript, theme smoke, model serving, protected progress route, and fixture removal pass.

- Unit checks: muscle-region mapping (including biceps femoris versus biceps brachii); binary GLB header, actual primitive/triangle/material counts, checksum, size budget, and license metadata.
- Browser fixtures: actual WebGL model load, one cached model request, front/back and angle changes, pointer drag, optional rotation/pause, disabled export during motion, settled-pose PNG, caption attribution, six viewport widths, palette changes, reduced motion, context-loss fallback/retry, and close/reopen cleanup.
- Existing share regression covers layouts, PNG formats, caption/privacy, clipboard, native-share mocks, loading retry, and transparency.
- Initial model-network failure/retry, actual transparent 3D PNG alpha, and unavailable-WebGL fallback with a working 2D export also pass. Unit regression: 16 passed, one database integration check skipped.
- Real Android/iOS GPU performance and native share sheets still require device verification. The browser checks use Chromium with isolated server-action fixtures and do not write existing account records.
- Production build and standalone TypeScript pass. Production smoke verifies theme/navigation, private-route protection, the served GLB checksum and license, and removal of the temporary preview route. Server runs on port 3002.
