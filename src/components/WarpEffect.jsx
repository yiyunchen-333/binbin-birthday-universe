import { useEffect, useRef } from 'react'
import './WarpEffect.css'

const DURATION = 8500
const STAR_COUNT = 112
const Z_NEAR = 64
const Z_FAR = 1200

function easeInQuad(t) {
  return t * t
}

function rawDrive(elapsed) {
  if (elapsed <= 1600) return easeInQuad(elapsed / 1600) * 0.05
  if (elapsed <= 4600) {
    const along = (elapsed - 1600) / 3000
    return 0.05 + easeInQuad(along) * 0.95
  }
  return 1
}

function spawnStar(farOnly) {
  let x = 0
  let y = 0
  do {
    x = (Math.random() - 0.5) * 1000
    y = (Math.random() - 0.5) * 1000
  } while (x * x + y * y < 70 * 70)
  return {
    x,
    y,
    z: farOnly ? 820 + Math.random() * (Z_FAR - 820) : Z_NEAR + Math.random() * (Z_FAR - Z_NEAR),
    glow: 0.42 + Math.random() * 0.58,
  }
}

function clipOutside(x0, y0, x1, y1, radius) {
  const dx = x1 - x0
  const dy = y1 - y0
  const a = dx * dx + dy * dy
  const b = 2 * (x0 * dx + y0 * dy)
  const c = x0 * x0 + y0 * y0 - radius * radius
  const inside0 = c <= 0
  const inside1 = x1 * x1 + y1 * y1 <= radius * radius
  if (inside0 && inside1) return []
  const hits = []
  if (a > 0.001) {
    const disc = b * b - 4 * a * c
    if (disc >= 0) {
      const root = Math.sqrt(disc)
      const t1 = (-b - root) / (2 * a)
      const t2 = (-b + root) / (2 * a)
      if (t1 >= 0 && t1 <= 1) hits.push(t1)
      if (t2 >= 0 && t2 <= 1) hits.push(t2)
    }
  }
  if (inside0 && !inside1) return [[hits.length ? Math.max(...hits) : 0, 1]]
  if (!inside0 && inside1) return [[0, hits.length ? Math.min(...hits) : 1]]
  if (hits.length >= 2) {
    hits.sort((p, q) => p - q)
    return [
      [0, hits[0]],
      [hits[hits.length - 1], 1],
    ]
  }
  return [[0, 1]]
}

export function WarpEffect({ onDone }) {
  const canvasRef = useRef(null)
  const rootRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return undefined
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return undefined

    const stars = Array.from({ length: STAR_COUNT }, () => spawnStar(false))
    let frame = 0
    let start = 0
    let last = 0
    let finished = false

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const project = (star, z, centerX, centerY, scale) => ({
      x: centerX + (star.x / z) * scale,
      y: centerY + (star.y / z) * scale,
    })

    const loop = (now) => {
      if (!start) {
        start = now
        last = now
      }
      const elapsed = now - start
      const dt = Math.min(2.2, (now - last) / 16.67)
      last = now
      const thrust = Math.min(0.82, rawDrive(elapsed)) / 0.82
      const speed = 5.4 + thrust * 21
      const exposure = 4.5 + thrust * 10.5
      const appear = Math.min(1, elapsed / 1400)
      const width = window.innerWidth
      const height = window.innerHeight
      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.55
      const hole = Math.max(92, Math.min(width, height) * 0.078)

      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.globalCompositeOperation = 'source-over'

      stars.forEach((star) => {
        star.z -= speed * dt
        if (star.z <= Z_NEAR) {
          Object.assign(star, spawnStar(true))
          return
        }

        const trailZ = Math.min(Z_FAR, star.z + speed * dt * exposure)
        const prev = project(star, trailZ, centerX, centerY, scale)
        const next = project(star, star.z, centerX, centerY, scale)
        const margin = 80
        const outside = (point) =>
          point.x < -margin || point.y < -margin || point.x > width + margin || point.y > height + margin
        if (outside(prev) && outside(next)) {
          Object.assign(star, spawnStar(true))
          return
        }

        const depth = Math.max(0, Math.min(1, 1 - (star.z - Z_NEAR) / (Z_FAR - Z_NEAR)))
        const alpha = appear * star.glow * (0.14 + depth * 0.82)
        const parts = clipOutside(prev.x - centerX, prev.y - centerY, next.x - centerX, next.y - centerY, hole)
        parts.forEach(([fromT, toT]) => {
          const x0 = prev.x + (next.x - prev.x) * fromT
          const y0 = prev.y + (next.y - prev.y) * fromT
          const x1 = prev.x + (next.x - prev.x) * toT
          const y1 = prev.y + (next.y - prev.y) * toT
          if (Math.hypot(x1 - x0, y1 - y0) < 0.4) return
          const paint = context.createLinearGradient(x0, y0, x1, y1)
          paint.addColorStop(0, `rgba(255, 248, 252, ${alpha * 0.12})`)
          paint.addColorStop(1, `rgba(255, 255, 255, ${alpha})`)
          context.strokeStyle = paint
          context.lineWidth = 0.4 + depth * 1.7
          context.shadowBlur = 1.4 + depth * 7
          context.shadowColor = `rgba(255, 255, 255, ${alpha * 0.7})`
          context.beginPath()
          context.moveTo(x0, y0)
          context.lineTo(x1, y1)
          context.stroke()
        })
      })

      context.shadowBlur = 0

      if (elapsed > 7900) {
        root.style.opacity = String(Math.max(0, 1 - (elapsed - 7900) / 600))
      }

      if (elapsed >= DURATION) {
        if (!finished) {
          finished = true
          onDoneRef.current?.()
        }
        return
      }
      frame = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={rootRef} className="warp-root" aria-hidden="true">
      <canvas ref={canvasRef} className="warp-canvas" />
      <p className="warp-line">across the universe, to you.</p>
    </div>
  )
}
