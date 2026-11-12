import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import './Page6.css'

const CX = 160

function ring(cy, rx, ry, count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count
    return [CX + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]
  })
}

const TIERS = [
  { cy: 150, rx: 50, ry: 10, height: 38, count: 12 },
  { cy: 196, rx: 78, ry: 12, height: 44, count: 16 },
  { cy: 250, rx: 118, ry: 14, height: 46, count: 22 },
]

const CANDLES = [
  { x: 146, top: 88 },
  { x: 160, top: 76 },
  { x: 174, top: 88 },
]

function pointsToPath(points, close) {
  const [first, ...rest] = points
  const line = rest.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return `M ${first[0].toFixed(1)} ${first[1].toFixed(1)} ${line}${close ? ' Z' : ''}`
}

function tierGeometry(tier) {
  const top = ring(tier.cy, tier.rx, tier.ry, tier.count)
  const bottom = ring(tier.cy + tier.height, tier.rx, tier.ry, tier.count)
  const spokes = [Math.floor(tier.count / 4), Math.floor((tier.count * 3) / 4)].map((index) => [
    top[index],
    bottom[index],
  ])
  return { top, bottom, spokes }
}

const CAKE = TIERS.map(tierGeometry)

export function Page6() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const [lit, setLit] = useState([true, true, true])
  const ready = lit.every((on) => !on)

  const blowOne = (index) => {
    setLit((current) => current.map((on, i) => (i === index ? false : on)))
  }

  return (
    <section className="page6" aria-label="Page 6">
      <div className="page6-stage">
        <div className="page6-bg" aria-hidden="true" />
        <div className="page6-dim" aria-hidden="true" />

        <header className="page6-copy">
          <p className="page6-kicker">A LITTLE STARDUST, A WISH FOR YOU</p>
          <h1>Happy Birthday</h1>
          <p className="page6-sub">很高兴这个宇宙里有你。</p>
        </header>

        <div className="page6-cake">
          <svg viewBox="0 58 320 262" className="page6-constellation" role="img" aria-label="星光蛋糕">
            <defs>
              <radialGradient id="page6-flame" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="45%" stopColor="#ffe3a8" />
                <stop offset="100%" stopColor="#ffb15a" stopOpacity="0.15" />
              </radialGradient>
              <filter id="page6-star" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g fill="none" stroke="rgba(255, 246, 248, 0.42)" strokeWidth="0.7" strokeLinejoin="round">
              {CAKE.map((tier, index) => (
                <g key={index}>
                  <path d={pointsToPath(tier.top, true)} />
                  <path d={pointsToPath(tier.bottom, true)} />
                  {tier.spokes.map(([from, to], spoke) => (
                    <path key={spoke} d={pointsToPath([from, to], false)} />
                  ))}
                </g>
              ))}
            </g>

            <g
              fill="none"
              stroke="rgba(255, 250, 246, 0.82)"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              {CANDLES.map((candle) => (
                <path key={candle.x} d={`M ${candle.x} 140 L ${candle.x} ${candle.top + 8}`} />
              ))}
            </g>

            <g filter="url(#page6-star)" fill="#fff">
              {CAKE.flatMap((tier) => [...tier.top, ...tier.bottom]).map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r={index % 5 === 0 ? 1.7 : 1.15} />
              ))}
            </g>

            {CANDLES.map((candle, index) => (
              <g key={candle.x}>
                {!lit[index] &&
                  [0, 1, 2].map((wisp) => (
                    <motion.circle
                      key={wisp}
                      cx={candle.x + (wisp - 1) * 4}
                      cy={candle.top}
                      r={1.6 + wisp * 0.4}
                      fill="rgba(226, 226, 234, 0.55)"
                      initial={{ opacity: 0.45 }}
                      animate={{ cy: candle.top - 26 - wisp * 8, opacity: 0 }}
                      transition={{ duration: 1.05, ease: 'easeOut', delay: wisp * 0.05 }}
                    />
                  ))}
                <motion.circle
                  cx={candle.x}
                  cy={candle.top}
                  r={6.5}
                  fill="url(#page6-flame)"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  animate={
                    lit[index]
                      ? { scale: [1, 1.16, 0.94, 1.08], opacity: [0.88, 1, 0.8, 1] }
                      : { scale: 0.15, opacity: 0 }
                  }
                  transition={
                    lit[index]
                      ? { duration: 1.35 + index * 0.15, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.28, ease: 'easeIn' }
                  }
                />
                {lit[index] && (
                  <circle
                    cx={candle.x}
                    cy={candle.top}
                    r={16}
                    fill="transparent"
                    className="page6-flame-hit"
                    onClick={() => blowOne(index)}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        <footer className="page6-foot">
          <p>
            许个愿 · 轻触星光吹灭蜡烛
            <span className="page6-foot-arrow" aria-hidden="true">↗</span>
          </p>
          <p className="page6-foot-en">make a wish · touch to blow out the candles</p>
          <button
            type="button"
            className={ready ? 'page6-next is-ready' : 'page6-next'}
            disabled={!ready}
            onClick={() => setCurrentPage(8)}
          >
            for you
            <span aria-hidden="true">↗</span>
          </button>
        </footer>
      </div>
    </section>
  )
}
