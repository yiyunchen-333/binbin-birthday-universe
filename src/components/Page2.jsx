import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import './Page1.css'
import './Page2.css'

const TOTAL = 3.5
const SCATTER = 0.5
const SCATTER_AT = SCATTER / TOTAL
const EASE_OUT = [0.05, 0.9, 0.18, 1]
const EASE_IN = [0.45, 0, 0.85, 1]

const RINGS = [
  { id: 0, delay: 0.5, scale: 42, opacity: 0.32 },
  { id: 1, delay: 0.7, scale: 54, opacity: 0.22 },
  { id: 2, delay: 0.9, scale: 66, opacity: 0.14 },
]

function mulberry32(seed) {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createParticles(count = 264) {
  const rand = mulberry32(20261021)
  return Array.from({ length: count }, (_, id) => {
    const angle = (id / count) * Math.PI * 2 + (rand() - 0.5) * 0.22
    const swift = id % 13 === 0
    const dist = swift ? 58 + rand() * 38 : 26 + rand() * 34
    const kick = swift ? 0.88 : 0.78
    return {
      id,
      swift,
      rotate: (angle * 180) / Math.PI,
      length: swift ? 122 + rand() * 72 : 28 + rand() * 40,
      x0: Math.cos(angle) * 1.2,
      y0: Math.sin(angle) * 1.2,
      xMid: Math.cos(angle) * dist * kick,
      yMid: Math.sin(angle) * dist * kick,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: swift ? 0.95 : 0.55 + rand() * 0.25,
    }
  })
}

export function Page2() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const particles = useMemo(() => createParticles(264), [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(3)
    }, TOTAL * 1000)
    return () => window.clearTimeout(timer)
  }, [setCurrentPage])

  return (
    <section className="page2" aria-hidden="true">
      <div className="page2-frame">
        <div className="page2-stage">
          <div className="page1-cluster">
            <h1 className="page1-headline page2-ghost">
              一个奇迹的诞生，
              <br />
              是这个宇宙的源头。
            </h1>

            <div className="page2-origin">
              {RINGS.map((ring) => (
                <motion.span
                  key={ring.id}
                  className="page2-ring"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: ring.scale, opacity: [0, ring.opacity, 0] }}
                  transition={{
                    delay: ring.delay,
                    duration: TOTAL - ring.delay,
                    times: [0, 0.08, 1],
                    ease: [EASE_OUT, EASE_IN],
                  }}
                />
              ))}

              {particles.map((particle) => (
                <motion.span
                  key={particle.id}
                  className={particle.swift ? 'page2-dust is-swift' : 'page2-dust'}
                  style={{
                    width: particle.length,
                    marginLeft: -particle.length,
                    rotate: particle.rotate,
                  }}
                  initial={{
                    x: `${particle.x0}vmin`,
                    y: `${particle.y0}vmin`,
                    opacity: particle.opacity,
                  }}
                  animate={{
                    x: [`${particle.x0}vmin`, `${particle.xMid}vmin`, `${particle.x}vmin`],
                    y: [`${particle.y0}vmin`, `${particle.yMid}vmin`, `${particle.y}vmin`],
                    opacity: [particle.opacity, particle.opacity * 0.85, 0],
                  }}
                  transition={{
                    duration: TOTAL,
                    times: [0, SCATTER_AT, 1],
                    ease: [EASE_OUT, EASE_IN],
                  }}
                />
              ))}
            </div>

            <div className="page1-captions page2-ghost">
              <p className="page1-hint">轻触星光，亲手点亮属于我们的奇迹。</p>
              <p className="page1-hint-en">
                Touch the starlight, and kindle our miracle with your own hands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
