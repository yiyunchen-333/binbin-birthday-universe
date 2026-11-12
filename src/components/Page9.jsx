import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BLESSINGS } from '../data/blessings'
import './Page9.css'

const VB = { w: 1600, h: 900 }

const STARS = {
  left: { id: 'left', x: 492, y: 340, scale: 1 },
  right: { id: 'right', x: 1108, y: 340, scale: 1 },
  bottom: { id: 'bottom', x: 800, y: 652, scale: 1 },
  wish: { id: 'wish', x: 800, y: 374, scale: 0.88 },
}

function point(x, y, extra = {}) {
  return { x, y, ...extra }
}

function trapezoidCap(from, to, idPrefix) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  const tx = dx / len
  const ty = dy / len
  let nx = ty
  let ny = -tx
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const offset = 110
  const ratio = 0.34
  const midX = (from.x + to.x) / 2 + nx * offset
  const midY = (from.y + to.y) / 2 + ny * offset
  const half = (len * ratio) / 2
  return {
    nearFrom: point(midX - tx * half, midY - ty * half, { id: `${idPrefix}-a`, scale: 0.44 }),
    nearTo: point(midX + tx * half, midY + ty * half, { id: `${idPrefix}-w`, scale: 0.44 }),
  }
}

function outsideOnEdge(from, to, inside, id) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  let nx = -dy / len
  let ny = dx / len
  const toInsideX = inside.x - mx
  const toInsideY = inside.y - my
  if (nx * toInsideX + ny * toInsideY > 0) {
    nx = -nx
    ny = -ny
  }
  const dist = len * 0.08
  return point(mx + nx * dist, my + ny * dist, { id, scale: 0.44 })
}

const LEFT_CAP = trapezoidCap(STARS.left, STARS.wish, 'left')
const RIGHT_CAP = trapezoidCap(STARS.right, STARS.wish, 'right')
const LEFT_OUTER = outsideOnEdge(STARS.left, STARS.bottom, STARS.wish, 'left-outer')
const RIGHT_OUTER = outsideOnEdge(STARS.right, STARS.bottom, STARS.wish, 'right-outer')
const PINS = [
  LEFT_CAP.nearFrom,
  LEFT_CAP.nearTo,
  RIGHT_CAP.nearTo,
  RIGHT_CAP.nearFrom,
  LEFT_OUTER,
  RIGHT_OUTER,
]

const TRIANGLE = [STARS.left, STARS.right, STARS.bottom]

const FIELD = [
  point(210, 200, { id: 'field-1', scale: 0.44 }),
  point(580, 128, { id: 'field-2', scale: 0.38 }),
  point(1020, 128, { id: 'field-3', scale: 0.4 }),
  point(1390, 200, { id: 'field-4', scale: 0.46 }),
  point(1470, 500, { id: 'field-5', scale: 0.42 }),
  point(1180, 780, { id: 'field-6', scale: 0.36 }),
  point(420, 780, { id: 'field-7', scale: 0.4 }),
  point(130, 500, { id: 'field-8', scale: 0.48 }),
  point(330, 545, { id: 'field-9', scale: 0.42 }),
  point(1270, 545, { id: 'field-10', scale: 0.42 }),
]

function spinFor(id) {
  let hash = 2166136261
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
  return {
    rotate: hash % 2 === 0 ? 360 : -360,
    duration: 18 + (hash % 31),
    pulse: 3.1 + ((hash >>> 5) % 29) / 10,
    delay: ((hash >>> 11) % 37) / 10,
  }
}

function to(star) {
  return `${star.x} ${star.y}`
}

const HEART_D = [
  `M ${to(LEFT_CAP.nearFrom)}`,
  `L ${to(LEFT_CAP.nearTo)}`,
  `L ${to(STARS.wish)}`,
  `L ${to(RIGHT_CAP.nearTo)}`,
  `L ${to(RIGHT_CAP.nearFrom)}`,
  `L ${to(STARS.right)}`,
  `L ${to(RIGHT_OUTER)}`,
  `L ${to(STARS.bottom)}`,
  `L ${to(LEFT_OUTER)}`,
  `L ${to(STARS.left)}`,
  `Z`,
].join(' ')

const HEART_CENTER = { x: 800, y: 470 }
const HEART_RING = [
  STARS.wish,
  RIGHT_CAP.nearTo,
  RIGHT_CAP.nearFrom,
  STARS.right,
  RIGHT_OUTER,
  STARS.bottom,
  LEFT_OUTER,
  STARS.left,
  LEFT_CAP.nearFrom,
  LEFT_CAP.nearTo,
]

const DRAW_DURATION = 4.6
const LIGHT_STEP = 0.3
const BURST_TOTAL = 1.6
const BURST_SCATTER = 0.32
const BURST_SCATTER_AT = BURST_SCATTER / BURST_TOTAL
const BURST_EASE_OUT = [0.05, 0.9, 0.18, 1]
const BURST_EASE_IN = [0.45, 0, 0.85, 1]

const fade = { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
const fadeOut = { duration: 0.32, ease: 'easeOut' }

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

function createBurstParticles(count = 176) {
  const rand = mulberry32(20261021)
  return Array.from({ length: count }, (_, id) => {
    const angle = (id / count) * Math.PI * 2 + (rand() - 0.5) * 0.22
    const swift = id % 13 === 0
    const dist = swift ? 22 + rand() * 14 : 9 + rand() * 13
    const kick = swift ? 0.88 : 0.78
    return {
      id,
      swift,
      rotate: (angle * 180) / Math.PI,
      length: swift ? 72 + rand() * 48 : 18 + rand() * 28,
      x0: Math.cos(angle) * 0.4,
      y0: Math.sin(angle) * 0.4,
      xMid: Math.cos(angle) * dist * kick,
      yMid: Math.sin(angle) * dist * kick,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: swift ? 0.95 : 0.55 + rand() * 0.25,
    }
  })
}

function starStyle(star) {
  return {
    left: `${(star.x / VB.w) * 100}%`,
    top: `${(star.y / VB.h) * 100}%`,
    '--star-scale': star.scale,
  }
}

function CrossStar({
  lit,
  boosted,
  flare,
  onClick,
  disabled,
  delay = 0,
  label,
  labelPlace = 'below',
  decorative = false,
  spinId = '',
  field = false,
}) {
  const spin = spinFor(spinId || label || 'star')
  const className = `page9-spark${lit ? ' is-on' : ''}${boosted ? ' is-boosted' : ''}${flare ? ' is-flare' : ''}${labelPlace === 'above' ? ' label-above' : ''}${decorative ? ' is-pin' : ''}${field ? ' is-field' : ''}`
  const Tag = decorative ? 'span' : 'button'
  return (
    <Tag
      type={decorative ? undefined : 'button'}
      className={className}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label || '星光'}
      disabled={decorative ? undefined : disabled}
      onClick={decorative ? undefined : onClick}
    >
      <span className="page9-star">
        <motion.span
          className="page9-star-spin"
          animate={{ rotate: spin.rotate }}
          transition={{ duration: spin.duration, repeat: Infinity, ease: 'linear' }}
        >
          <motion.span
            className="page9-star-axis page9-star-axis-v"
            animate={{ scaleY: [0.52, 1, 0.52] }}
            transition={{ duration: spin.pulse, repeat: Infinity, ease: 'easeInOut', delay: delay + spin.delay }}
          />
          <motion.span
            className="page9-star-axis page9-star-axis-h"
            animate={{ scaleX: [1, 0.52, 1] }}
            transition={{ duration: spin.pulse, repeat: Infinity, ease: 'easeInOut', delay: delay + spin.delay }}
          />
          <span className="page9-star-corners" />
          <span className="page9-star-core" />
        </motion.span>
      </span>
      {label && <span className="page9-star-hover">{label}</span>}
    </Tag>
  )
}

function BlessingModal({ blessing, onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return undefined
    node.focus({ preventScroll: true })
    node.scrollTop = 0

    let target = 0
    let frame = 0
    let writing = false

    const maxScroll = () => Math.max(0, node.scrollHeight - node.clientHeight)
    const clamp = (value) => Math.max(0, Math.min(value, maxScroll()))

    const glide = (next) => {
      target = clamp(next)
      if (frame) return
      const step = () => {
        const distance = target - node.scrollTop
        if (Math.abs(distance) < 0.35) {
          writing = true
          node.scrollTop = target
          writing = false
          frame = 0
          return
        }
        writing = true
        node.scrollTop += distance * 0.16
        writing = false
        frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const onKey = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Escape') {
        onClose()
        return
      }

      const line = Math.max(28, Math.round(node.clientHeight * 0.09))
      const page = Math.max(140, Math.round(node.clientHeight * 0.78))

      if (event.key === 'ArrowDown') glide(target + line)
      else if (event.key === 'ArrowUp') glide(target - line)
      else if (event.key === 'PageDown') glide(target + page)
      else if (event.key === 'PageUp') glide(target - page)
      else if (event.key === ' ') glide(target + (event.shiftKey ? -page : page))
      else if (event.key === 'Home') glide(0)
      else if (event.key === 'End') glide(maxScroll())
      else return

      event.preventDefault()
    }

    const onWheel = (event) => {
      event.preventDefault()
      const delta =
        event.deltaMode === 1
          ? event.deltaY * 18
          : event.deltaMode === 2
            ? event.deltaY * node.clientHeight
            : event.deltaY
      glide(target + delta)
    }

    const onScroll = () => {
      if (!writing && !frame) target = node.scrollTop
    }

    window.addEventListener('keydown', onKey)
    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [blessing.id, onClose])

  return (
    <motion.div
      className="page9-blessing"
      role="dialog"
      aria-modal="true"
      aria-label={blessing.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="page9-blessing-shade" aria-hidden="true" />
      <div className="page9-blessing-close-stage">
        <div className="page9-blessing-close-frame">
          <button type="button" className="page9-blessing-close" onClick={onClose}>
            <span className="page9-blessing-x" aria-hidden="true" />
            回到星空里
          </button>
          <div className="page9-blessing-panel-wrap">
            <motion.div
              ref={scrollRef}
              tabIndex={-1}
              className={`page9-blessing-panel${blessing.photos?.length ? ' has-photos' : ''}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
            <article className="page9-blessing-letter-roll">
              <p className="page9-blessing-title">{blessing.title}</p>
              {blessing.letters?.map((letter) => (
                <section key={letter.from} className="page9-blessing-letter">
                  <h2>{letter.from}</h2>
                  {letter.body.split('\n').map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </section>
              ))}
              {blessing.photos?.map((src) => (
                <figure key={src} className="page9-blessing-photo">
                  <img src={src} alt="" />
                </figure>
              ))}
            </article>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Page9() {
  const [clicked, setClicked] = useState(() => new Set())
  const [ripples, setRipples] = useState([])
  const [phase, setPhase] = useState('intro')
  const [wishArmed, setWishArmed] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [flareId, setFlareId] = useState(null)
  const [bursting, setBursting] = useState(false)
  const closeBlessing = useCallback(() => setOpenId(null), [])
  const burstParticles = useMemo(() => createBurstParticles(176), [])

  const triangleReady = TRIANGLE.every((star) => clicked.has(star.id))
  const drawing =
    phase === 'drawing' || phase === 'lighting' || phase === 'burst' || phase === 'finale'
  const boosted = phase === 'finale'
  const showIntro = phase === 'intro' || phase === 'wish' || phase === 'drawing'
  const showWishHint = phase === 'wish' || phase === 'drawing'
  const locked = drawing

  useEffect(() => {
    if (phase !== 'wish') {
      setWishArmed(false)
      return undefined
    }
    const timer = window.setTimeout(() => setWishArmed(true), 520)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'drawing') return undefined
    const timer = window.setTimeout(() => setPhase('lighting'), DRAW_DURATION * 1000)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'lighting') return undefined
    let index = 0
    setFlareId(HEART_RING[0].id)
    const timer = window.setInterval(() => {
      index += 1
      if (index >= HEART_RING.length) {
        window.clearInterval(timer)
        setFlareId(null)
        setPhase('burst')
        return
      }
      setFlareId(HEART_RING[index].id)
    }, LIGHT_STEP * 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'burst') return undefined
    setBursting(true)
    const endTimer = window.setTimeout(() => setPhase('finale'), BURST_TOTAL * 1000)
    return () => window.clearTimeout(endTimer)
  }, [phase])

  const spark = (star) => {
    setRipples((current) => [...current, { key: `${star.id}-${Date.now()}`, x: star.x, y: star.y }])
    if (star.id === 'wish') {
      if (!wishArmed) return
      setPhase('drawing')
      return
    }
    setClicked((current) => {
      const next = new Set(current)
      next.add(star.id)
      if (TRIANGLE.every((item) => next.has(item.id))) setPhase('wish')
      return next
    })
    setOpenId(star.id)
  }

  const reset = () => {
    setClicked(new Set())
    setRipples([])
    setPhase('intro')
    setFlareId(null)
    setBursting(false)
  }

  return (
    <section className="page9" aria-label="Page 9">
      <div className="page9-stage">
        <div className="page9-bg" aria-hidden="true" />
        <div className="page9-dim" aria-hidden="true" />

        <svg className="page9-lines" viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
          <defs>
            <filter id="page9-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {drawing && (
            <motion.path
              d={HEART_D}
              fill="none"
              stroke="rgba(255, 250, 252, 0.94)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="miter"
              pathLength={1}
              strokeDasharray="1"
              filter="url(#page9-glow)"
              initial={{ strokeDashoffset: 1 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: DRAW_DURATION, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>

        <AnimatePresence>
          {showIntro && (
            <motion.header
              className="page9-copy"
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={phase === 'drawing' ? fade : fadeOut}
            >
              <h1>点亮其他照亮这个宇宙的星光</h1>
              <p className="page9-copy-en">Magic is happening</p>
            </motion.header>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showIntro && (
            <motion.p
              key="intro-hint"
              className="page9-foot-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={phase === 'drawing' ? fade : fadeOut}
            >
              轻触星光，查收祝福
              <span className="page9-foot-arrow" aria-hidden="true">
                ↗
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        {FIELD.map((star, index) => (
          <div key={star.id} className="page9-node page9-node-field" style={starStyle(star)}>
            <motion.div
              className="page9-node-breathe"
              animate={{ opacity: boosted ? 0.92 : [0.52, 0.86, 0.52] }}
              transition={{ duration: 2.8 + index * 0.17, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CrossStar decorative field spinId={star.id} delay={index * 0.11} />
            </motion.div>
          </div>
        ))}

        {PINS.map((star, index) => (
          <div key={star.id} className="page9-node page9-node-pin" style={starStyle(star)}>
            <motion.div
              className="page9-node-breathe"
              animate={{ opacity: boosted || flareId === star.id ? 1 : [0.55, 0.88, 0.55] }}
              transition={
                boosted || flareId === star.id
                  ? { duration: 0.22 }
                  : { duration: 3.4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <CrossStar
                lit={drawing}
                boosted={boosted}
                flare={flareId === star.id}
                decorative
                spinId={star.id}
                delay={index * 0.25}
              />
            </motion.div>
          </div>
        ))}

        {TRIANGLE.map((star, index) => (
          <div key={star.id} className="page9-node" style={starStyle(star)}>
            <motion.div
              className="page9-node-breathe"
              animate={{ opacity: boosted || flareId === star.id ? 1 : [0.72, 1, 0.72] }}
              transition={
                boosted || flareId === star.id
                  ? { duration: 0.22 }
                  : { duration: 3.2 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <CrossStar
                lit={clicked.has(star.id)}
                boosted={boosted}
                flare={flareId === star.id}
                disabled={locked}
                delay={index * 0.4}
                spinId={star.id}
                label={BLESSINGS[star.id].hover}
                labelPlace={star.id === 'bottom' ? 'above' : 'below'}
                onClick={() => spark(star)}
              />
            </motion.div>
          </div>
        ))}

        <div
          className={`page9-node page9-node-wish${triangleReady ? ' is-ready' : ''}`}
          style={starStyle(STARS.wish)}
        >
          <motion.div
            className="page9-node-breathe"
            animate={{
              opacity:
                boosted || flareId === STARS.wish.id
                  ? 1
                  : triangleReady
                    ? [0.78, 1, 0.78]
                    : [0.42, 0.62, 0.42],
            }}
            transition={
              boosted || flareId === STARS.wish.id
                ? { duration: 0.22 }
                : { duration: triangleReady ? 2.6 : 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <CrossStar
              lit={triangleReady}
              boosted={boosted}
              flare={flareId === STARS.wish.id}
              disabled={locked || !wishArmed}
              delay={0.2}
              spinId={STARS.wish.id}
              onClick={() => spark(STARS.wish)}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {showWishHint && (
            <motion.p
              key="wish-hint"
              className="page9-wish-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={fadeOut}
            >
              点击点亮最后的心愿
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {bursting && (
            <motion.div
              key="heart-burst"
              className="page9-burst"
              style={starStyle(HEART_CENTER)}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {burstParticles.map((particle) => (
                <motion.span
                  key={particle.id}
                  className={particle.swift ? 'page9-burst-dust is-swift' : 'page9-burst-dust'}
                  style={{
                    width: particle.length,
                    marginLeft: -particle.length,
                    rotate: particle.rotate,
                  }}
                  initial={{
                    x: `${particle.x0}cqi`,
                    y: `${particle.y0}cqi`,
                    opacity: particle.opacity,
                  }}
                  animate={{
                    x: [`${particle.x0}cqi`, `${particle.xMid}cqi`, `${particle.x}cqi`],
                    y: [`${particle.y0}cqi`, `${particle.yMid}cqi`, `${particle.y}cqi`],
                    opacity: [particle.opacity, particle.opacity * 0.85, 0],
                  }}
                  transition={{
                    duration: BURST_TOTAL,
                    times: [0, BURST_SCATTER_AT, 1],
                    ease: [BURST_EASE_OUT, BURST_EASE_IN],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.key}
              className="page9-ripple"
              style={starStyle(ripple)}
              initial={{ opacity: 0.32, scale: 0.2 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              onAnimationComplete={() =>
                setRipples((current) => current.filter((item) => item.key !== ripple.key))
              }
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'finale' && (
            <motion.p
              key="finale-zh"
              className="page9-finale-zh"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              此后，一直为你亮着
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'finale' && (
            <motion.div
              key="finale"
              className="page9-finale"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="page9-finale-ever">Evermore</p>
              <p className="page9-finale-gift">这是我要给你的，</p>
              <p className="page9-finale-gift">宇宙级别的浪漫。</p>
              <p className="page9-finale-en">all of this, for you.</p>
              <button type="button" className="page9-reset" onClick={reset}>
                再看一次星光 <span aria-hidden="true">↺</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {openId && BLESSINGS[openId] && (
          <BlessingModal key={openId} blessing={BLESSINGS[openId]} onClose={closeBlessing} />
        )}
      </AnimatePresence>
    </section>
  )
}
