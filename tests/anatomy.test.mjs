import test from 'node:test'
import assert from 'node:assert/strict'
import { muscleGroupForName } from '../lib/anatomy.ts'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

test('anatomy regions distinguish legs, arms, shoulders, and torso', () => {
  for (const [name, expected] of [
    ['Long head of left biceps femoris', 'legs'],
    ['Long head of left biceps brachii', 'arms'],
    ['Clavicular part of right deltoid', 'shoulders'],
    ['Left infraspinatus muscle', 'shoulders'],
    ['Left latissimus dorsi', 'back'],
    ['Sternocostal part of left pectoralis major', 'chest'],
    ['Left rectus abdominis', 'core'],
    ['Right external oblique', 'core'],
    ['Left gluteus maximus', 'legs'],
    ['Left frontalis', null],
    ['Unknown', null],
  ]) assert.equal(muscleGroupForName(name), expected, name)
})

test('shipped 3D asset keeps its checksum, muscle regions, and mobile budget', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/models/anatomy-manifest.json', import.meta.url), 'utf8'))
  const bytes = readFileSync(new URL('../public/models/gymbro-anatomy.glb', import.meta.url))
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF')
  assert.equal(bytes.readUInt32LE(4), 2)
  const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)))
  const primitives = gltf.meshes.flatMap(mesh => mesh.primitives)
  assert.equal(primitives.length, 8)
  assert.equal(primitives.reduce((count, primitive) => count + gltf.accessors[primitive.indices].count / 3, 0), manifest.triangles)
  assert.deepEqual(gltf.materials.map(material => material.name).sort(), [...manifest.groups].sort())
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.sha256)
  assert(bytes.length < 1_200_000)
  assert(manifest.triangles < 200_000)
  assert.equal(manifest.primitives, 8)
  assert.deepEqual([...manifest.groups].sort(), ['arms', 'back', 'bone', 'chest', 'core', 'legs', 'neutral', 'shoulders'])
  assert.equal(manifest.license, 'CC BY-SA 4.0')
})
