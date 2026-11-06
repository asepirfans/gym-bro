'use client'

import { useEffect, useId, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { Pause, RotateCw } from 'lucide-react'

export interface AnatomyFrame { image: string | null; status: 'ready' | 'moving' | 'error' }
interface Props {
  paired: boolean
  accent: string
  muscles: Record<string, number>
  onFrame: (frame: AnatomyFrame) => void
  mode?: 'share' | 'progress'
}
let model: ReturnType<GLTFLoader['loadAsync']> | null = null
function loadModel() {
  if (!model) model = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/models/gymbro-anatomy.glb').catch(error => { model = null; throw error })
  return model
}

export default function WorkoutAnatomy3D({ paired, accent, muscles, onFrame, mode = 'share' }: Props) {
  const instanceId = useId()
  const angleId = mode === 'share' ? 'share-body-angle' : `progress-body-angle-${instanceId}`
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<{ rotate: (angle: number, moving?: boolean) => void } | null>(null)
  const frameRef = useRef(onFrame)
  frameRef.current = onFrame
  const [angle, setAngle] = useState(0)
  const angleRef = useRef(0)
  const [automatic, setAutomatic] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const drag = useRef<{ x: number; angle: number } | null>(null)
  const muscleKey = JSON.stringify(muscles)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let failedState = false
    let renderer: THREE.WebGLRenderer | null = null
    let snapshotTimer: ReturnType<typeof setTimeout> | undefined
    const materials: THREE.MeshStandardMaterial[] = []
    setStatus('loading')
    setAutomatic(false)
    frameRef.current({ image: null, status: 'moving' })
    const failed = () => {
      if (disposed) return
      failedState = true
      clearTimeout(snapshotTimer)
      setStatus('error')
      setAutomatic(false)
      viewRef.current = null
      frameRef.current({ image: null, status: 'error' })
    }
    async function setup() {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' })
        renderer.setPixelRatio(1)
        const width = mode === 'progress' ? 900 : paired ? 1200 : 640
        renderer.setSize(width, 900)
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.1
        renderer.domElement.setAttribute('aria-hidden', 'true')
        renderer.domElement.addEventListener('webglcontextlost', failed)
        host?.replaceChildren(renderer.domElement)
        const asset = await loadModel()
        if (disposed || failedState) return
        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight(0xfff6e9, 0x62594f, 2))
        const key = new THREE.DirectionalLight(0xffffff, 3)
        key.position.set(3, 4, 5)
        scene.add(key)
        const rim = new THREE.DirectionalLight(0xf4cfb4, 2)
        rim.position.set(-3, 2, -4)
        scene.add(rim)
        const max = Math.max(...Object.values(muscles), 1)
        const figures: THREE.Group[] = []
        for (let i = 0; i < (paired ? 2 : 1); i++) {
          const body = asset.scene.clone(true)
          const bounds = new THREE.Box3().setFromObject(body)
          const size = bounds.getSize(new THREE.Vector3())
          const center = bounds.getCenter(new THREE.Vector3())
          const normalizer = new THREE.Group()
          const scale = 2 / size.y
          body.position.sub(center)
          normalizer.add(body)
          normalizer.scale.setScalar(scale)
          const pivot = new THREE.Group()
          pivot.add(normalizer)
          pivot.position.x = paired ? (i === 0 ? -.46 : .46) : 0
          body.traverse(object => {
            if (!(object instanceof THREE.Mesh)) return
            const original = object.material as THREE.Material
            const group = original.name
            const amount = muscles[group] || 0
            const color = new THREE.Color(group === 'bone' ? '#c7bfb4' : '#d1c6b8')
            if (amount > 0) color.lerp(new THREE.Color(accent), .5 + .5 * amount / max)
            const material = new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: .03 })
            materials.push(material)
            object.material = material
          })
          figures.push(pivot)
          scene.add(pivot)
        }
        const aspect = width / 900
        const camera = new THREE.OrthographicCamera(-1.12 * aspect, 1.12 * aspect, 1.12, -1.12, .1, 20)
        camera.position.set(0, .06, 5)
        camera.lookAt(0, 0, 0)
        let movingReported = false
        viewRef.current = { rotate: (degrees, moving = false) => {
          if (disposed || failedState || !renderer) return
          figures.forEach((figure, i) => { figure.rotation.y = degrees * Math.PI / 180 + i * Math.PI })
          renderer.render(scene, camera)
          clearTimeout(snapshotTimer)
          if (!movingReported) { frameRef.current({ image: null, status: 'moving' }); movingReported = true }
          if (!moving) snapshotTimer = setTimeout(() => {
            if (disposed || !renderer) return
            try {
              renderer.render(scene, camera)
              movingReported = false
              frameRef.current({ image: mode === 'share' ? renderer.domElement.toDataURL('image/png') : null, status: 'ready' })
            } catch { failed() }
          }, 100)
        } }
        setStatus('ready')
        viewRef.current.rotate(angleRef.current)
      } catch { failed() }
    }
    setup()
    return () => {
      disposed = true
      clearTimeout(snapshotTimer)
      viewRef.current = null
      materials.forEach(material => material.dispose())
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', failed)
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }
    }
  }, [paired, accent, muscleKey, retry, mode])

  useEffect(() => {
    if (!automatic || status !== 'ready') return
    let frame = 0
    let last = 0
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stop = () => { cancelAnimationFrame(frame); setAutomatic(false); viewRef.current?.rotate(angleRef.current) }
    const tick = (time: number) => {
      if (document.hidden || media.matches) { stop(); return }
      if (time - last >= 40) {
        angleRef.current = (angleRef.current + (last ? Math.min(time - last, 100) : 40) * .015) % 360
        setAngle(Math.round(angleRef.current))
        viewRef.current?.rotate(angleRef.current, true)
        last = time
      }
      frame = requestAnimationFrame(tick)
    }
    if (media.matches) { stop(); return }
    frame = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', stop)
    media.addEventListener('change', stop)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', stop); media.removeEventListener('change', stop) }
  }, [automatic, status])

  function rotate(degrees: number) {
    setAutomatic(false)
    angleRef.current = degrees
    setAngle(Math.round(degrees))
    viewRef.current?.rotate(degrees)
  }

  return <fieldset className="share-anatomy"><legend>Model otot 3D</legend>
    <div className={`share-anatomy-stage ${paired ? 'is-paired' : ''}`}>
      <div ref={hostRef} role="img" aria-label="Model anatomi 3D. Gunakan pengatur sudut di bawah untuk memutar tubuh." className="share-anatomy-canvas"
        onPointerDown={e => { if (status !== 'ready') return; drag.current = { x: e.clientX, angle: angleRef.current }; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={e => { if (drag.current) rotate((drag.current.angle + (e.clientX - drag.current.x) * .7 + 720) % 360) }}
        onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} />
      {status === 'loading' && <p className="share-anatomy-overlay" role="status">Memuat model 3D...</p>}
      {status === 'error' && <div className="share-anatomy-overlay" role="status"><p>3D belum tersedia di perangkat ini.{mode === 'share' ? ' Kartu memakai ilustrasi 2D.' : ''}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Coba 3D lagi</button></div>}
    </div>
    <label className="share-anatomy-angle" htmlFor={angleId}>Sudut tubuh <span>{angle}°</span></label>
    <input id={angleId} type="range" min="0" max="360" step="1" value={angle} disabled={status !== 'ready'} onChange={e => rotate(Number(e.target.value))} />
    <div className="share-segments"><button type="button" disabled={status !== 'ready'} onClick={() => rotate(0)}>Depan</button><button type="button" disabled={status !== 'ready'} onClick={() => rotate(180)}>Belakang</button><button type="button" disabled={status !== 'ready'} aria-pressed={automatic} onClick={() => { if (automatic) rotate(angleRef.current); else setAutomatic(true) }}>{automatic ? <Pause size={14} aria-hidden="true" /> : <RotateCw size={14} aria-hidden="true" />}{automatic ? 'Jeda' : 'Putar'}</button></div>
  </fieldset>
}
