import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import './Page5.css'

const STAR_COUNT = 18
const Z_NEAR = 48
const Z_FAR = 1200
const SPEED = 3.3
const EXPOSURE = 5.4

function spawnStar(farOnly) {
  let x = 0
  let y = 0
  do {
    x = (Math.random() - 0.5) * 1600
    y = (Math.random() - 0.5) * 1600
  } while (x * x + y * y < 120 * 120)
  return {
    x,
    y,
    z: farOnly ? 980 + Math.random() * (Z_FAR - 980) : 520 + Math.random() * (Z_FAR - 520),
    glow: 0.42 + Math.random() * 0.58,
  }
}

function SlowStars() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return undefined

    const stars = Array.from({ length: STAR_COUNT }, () => spawnStar(false))
    let frame = 0
    let last = 0

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
    }

    const loop = (now) => {
      const dt = last ? Math.min(2.2, (now - last) / 16.67) : 1
      last = now
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.82

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineCap = 'round'

      stars.forEach((star) => {
        star.z -= SPEED * dt
        if (star.z <= Z_NEAR) {
          Object.assign(star, spawnStar(true))
          return
        }
        const trailZ = Math.min(Z_FAR, star.z + SPEED * dt * EXPOSURE)
        const nextX = centerX + (star.x / star.z) * scale
        const nextY = centerY + (star.y / star.z) * scale
        const prevX = centerX + (star.x / trailZ) * scale
        const prevY = centerY + (star.y / trailZ) * scale
        const margin = 40
        if (
          (nextX < -margin || nextX > width + margin || nextY < -margin || nextY > height + margin) &&
          (prevX < -margin || prevX > width + margin || prevY < -margin || prevY > height + margin)
        ) {
          Object.assign(star, spawnStar(true))
          return
        }
        const depth = Math.max(0, Math.min(1, 1 - (star.z - 64) / (Z_FAR - 64)))
        const alpha = star.glow * (0.16 + depth * 0.7)
        if (Math.hypot(nextX - prevX, nextY - prevY) < 0.35) return
        const paint = context.createLinearGradient(prevX, prevY, nextX, nextY)
        paint.addColorStop(0, `rgba(255, 248, 252, ${alpha * 0.08})`)
        paint.addColorStop(1, `rgba(255, 255, 255, ${alpha})`)
        context.strokeStyle = paint
        context.lineWidth = 0.35 + depth * 1.15
        context.shadowBlur = 1 + depth * 3
        context.shadowColor = `rgba(255, 255, 255, ${alpha * 0.45})`
        context.beginPath()
        context.moveTo(prevX, prevY)
        context.lineTo(nextX, nextY)
        context.stroke()
      })

      context.shadowBlur = 0
      frame = requestAnimationFrame(loop)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="page5-slow" aria-hidden="true" />
}

export function Page5() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)

  return (
    <section className="page5" aria-label="Page 5">
      <div className="page5-stage">
        <div className="page5-bg" aria-hidden="true" />
        <div className="page5-dim" aria-hidden="true" />
        <SlowStars key="edge" />
        <div className="page5-line">
          <span>宇宙的尽头，依旧是你</span>
          <span>你就是那个奇迹，我的彬彬。</span>
          <span className="page5-line-en">I love you ,binbin, more than everything.</span>
          <button type="button" className="page5-line-cue" onClick={() => setCurrentPage(6)}>
            举杯同庆，这个属于你的时刻！
            <span className="page5-line-cue-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="page5-horizon" aria-hidden="true">
          <div className="page5-planet">
            <div className="page5-planet-dust" />
          </div>
          <div className="page5-air" />
          <div className="page5-sun">
            <span className="page5-sun-haze" />
            <span className="page5-sun-beam page5-sun-beam-far" />
            <span className="page5-sun-beam" />
            <span className="page5-sun-core" />
          </div>
        </div>
      </div>
    </section>
  )
}
