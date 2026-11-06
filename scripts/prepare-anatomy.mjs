import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { muscleGroupForName } from '../lib/anatomy.ts'

// Build-only tools live outside the app's runtime dependencies; see docs/anatomy-3d.md.
const requireTool = createRequire(new URL('../artifacts/anatomy/tools/package.json', import.meta.url))
const moduleFor = name => import(pathToFileURL(requireTool.resolve(name)).href)
const { NodeIO } = await moduleFor('@gltf-transform/core')
const { ALL_EXTENSIONS } = await moduleFor('@gltf-transform/extensions')
const { dequantize, flatten, join, simplify, weld, prune, meshopt } = await moduleFor('@gltf-transform/functions')
const { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } = await moduleFor('meshoptimizer')
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder })
const source = new URL('../artifacts/anatomy/source.glb', import.meta.url)
const sourceSha256 = createHash('sha256').update(readFileSync(source)).digest('hex')
if (sourceSha256 !== 'cc43a8b4f218bee5da78d6c1746bd21470d1d93c6878e33b4ccdbcfc7a72b98e') throw new Error('Source model changed. Verify the upstream model and license before rebuilding.')
const document = await io.read(fileURLToPath(source))
const root = document.getRoot()
const materials = Object.fromEntries(['neutral', 'bone', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'].map(group => [group, document.createMaterial(group).setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(.65)]))
await document.transform(dequantize())
for (const node of [...root.listNodes()]) {
  const mesh = node.getMesh()
  if (!mesh) continue
  const data = node.getExtras()
  if (data.layer === 'deep muscles') { node.dispose(); continue }
  const group = data.layer === 'skeleton' ? 'bone' : muscleGroupForName(data.name || node.getName()) || 'neutral'
  for (const primitive of mesh.listPrimitives()) {
    primitive.setMaterial(materials[group])
    primitive.setAttribute('COLOR_0', null)
  }
  node.setExtras({ group })
}
await document.transform(flatten(), join(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: .2, error: .002 }), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
const output = new URL('../public/models/gymbro-anatomy.glb', import.meta.url)
await io.write(fileURLToPath(output), document)
const bytes = readFileSync(output)
const triangles = root.listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, p) => n + (p.getIndices()?.getCount() || 0) / 3, 0), 0)
const manifest = { source: 'https://github.com/Charleeh/ecorche', sourceSha256: createHash('sha256').update(readFileSync(source)).digest('hex'), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, triangles, primitives: root.listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0), groups: root.listMaterials().map(m => m.getName()), license: 'CC BY-SA 4.0', changes: 'Removed deep layer; simplified, grouped by workout region, removed vertex colors, compressed with meshopt.' }
writeFileSync(new URL('../public/models/anatomy-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest))
