import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState, useRef } from 'react'
import { assetUrl } from '../assetUrl'
import { useAppStore } from '../store/useAppStore'
import './Page3.css'

const ALBUM_FOLDERS = {
  1: 'April',
  2: 'May',
  3: 'June',
  4: 'July&August',
  5: 'September',
  6: 'October',
}

const photoModules = import.meta.glob(
  '../../page 3照片库/**/*.{jpg,jpeg,png,webp,mp4,webm,mov,JPG,JPEG,PNG,WEBP,MP4,WEBM,MOV}',
  { eager: true, query: '?url', import: 'default' },
)

function isVideo(src) {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(src)
}

function photoOrder(path) {
  const file = path.split('/').pop() ?? ''
  const number = file.match(/^(\d+)/)
  return number ? Number(number[1]) : Number.POSITIVE_INFINITY
}

function photosIn(folder) {
  return Object.entries(photoModules)
    .filter(([path]) => path.replaceAll('\\', '/').split('/').includes(folder))
    .sort(([a], [b]) => photoOrder(a) - photoOrder(b) || a.localeCompare(b))
    .map(([, url]) => url)
}

const ALBUMS = Object.fromEntries(
  Object.entries(ALBUM_FOLDERS).map(([id, folder]) => [Number(id), photosIn(folder)]),
)

const popupEase = [0.22, 1, 0.36, 1]

const photoSlide = {
  enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction) => ({ x: direction > 0 ? '-100%' : '100%' }),
}

function MemoryVideo({ src }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(true)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const start = video.play()
    if (start?.catch) start.catch(() => setPaused(true))
    return () => video.pause()
  }, [src])

  return (
    <div className="memory-video">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        controls
        playsInline
        preload="auto"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => {
          const video = videoRef.current
          if (!video) return
          video.pause()
          setPaused(true)
        }}
        onError={() => setBroken(true)}
      />
      {broken ? (
        <p className="memory-video-error">这条视频浏览器无法打开</p>
      ) : (
        paused && (
          <button
            type="button"
            className="memory-play"
            aria-label="播放"
            onClick={() => videoRef.current?.play()}
          >
            ▶
          </button>
        )
      )}
    </div>
  )
}

function MemoryModal({ photos, onClose }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [generation, setGeneration] = useState(0)
  const count = photos.length

  const turn = useCallback(
    (delta) => {
      if (count === 0) return
      setDirection(delta)
      setGeneration((current) => current + 1)
      setIndex((current) => (current + delta + count) % count)
    },
    [count],
  )

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') turn(1)
      if (event.key === 'ArrowLeft') turn(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, turn])

  useEffect(() => {
    if (count < 2) return undefined
    const ahead = [(index + 1) % count, (index - 1 + count) % count]
    ahead.forEach((slot) => {
      if (isVideo(photos[slot])) return
      const image = new Image()
      image.src = photos[slot]
    })
    return undefined
  }, [count, index, photos])

  return (
    <motion.div
      className="memory"
      role="dialog"
      aria-modal="true"
      aria-label="a memory, kept just for us"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: popupEase }}
    >
      <motion.div
        className="memory-shade"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: popupEase }}
      />
      <div className="memory-close-stage">
        <div className="memory-close-frame">
          <button type="button" className="memory-close" onClick={onClose}>
            <span className="memory-x" aria-hidden="true" />
            回到星空里
          </button>
        </div>
      </div>

      <motion.div
        className="memory-panel"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: popupEase }}
      >
        <p className="memory-title">a memory, kept just for us</p>
        <div className="memory-row">
          <button
            type="button"
            className="memory-arrow"
            aria-label="上一张"
            onClick={() => turn(-1)}
          >
            ‹
          </button>
          <div className="memory-frame">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                className="memory-slide"
                key={`${photos[index]}-${generation}`}
                custom={direction}
                variants={photoSlide}
                initial={direction === 0 ? false : 'enter'}
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: popupEase }}
              >
                {isVideo(photos[index]) ? (
                  <MemoryVideo key={photos[index]} src={photos[index]} />
                ) : (
                  <img src={photos[index]} alt="" draggable={false} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            type="button"
            className="memory-arrow"
            aria-label="下一张"
            onClick={() => turn(1)}
          >
            ›
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ORBIT_SECONDS = 48

const CENTER_Y = 0.5
const PLANE = -8

const ORBITS = [
  { rx: 0.34, ry: 0.226, rot: PLANE },
  { rx: 0.38, ry: 0.253, rot: PLANE },
]

const PLANET_PATH = { rx: 0.36, ry: 0.24, rot: PLANE }

const NOTES = [
  '202604 · 相遇',
  '202605 · 相恋',
  '202606 · 相融',
  '202607-08 · 相伴',
  '202509 · 相知',
  '202610 · 相爱',
]

const PLANETS = [1, 2, 3, 4, 5, 6].map((id) => ({
  id,
  src: assetUrl(`assets/planet-${id}.png`),
  phase: ((id - 1) / 6) * Math.PI * 2,
  duration: 48,
  note: NOTES[id - 1],
}))

function Planet({ planet, radius, squash, onOpen }) {
  const delay = `${-((planet.id - 1) / PLANETS.length) * ORBIT_SECONDS}s`

  return (
    <div className="planet-slot" data-phase={planet.phase}>
      <div className="planet-tilt" style={{ transform: `rotate(${PLANE}deg) scaleY(${squash})` }}>
        <div
          className="planet-rotor"
          style={{ animationDuration: `${ORBIT_SECONDS}s`, animationDelay: delay }}
        >
          <div className="planet-arm" style={{ transform: `translateX(${radius}px)` }}>
            <div
              className="planet-counter"
              style={{ animationDuration: `${ORBIT_SECONDS}s`, animationDelay: delay }}
            >
              <div
                className="planet-upright"
                style={{ transform: `scaleY(${1 / squash}) rotate(${-PLANE}deg)` }}
              >
                <button
                  type="button"
                  className={`planet planet-${planet.id}`}
                  aria-label={`${String(planet.id).padStart(2, '0')} ${planet.note}`}
                  onClick={() => onOpen(planet.id)}
                >
                  <span className="planet-no">{String(planet.id).padStart(2, '0')}</span>
                  <img src={planet.src} alt="" draggable="false" />
                  <span className="planet-note">{planet.note}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Page3() {
  const stageRef = useRef(null)
  const cursorRef = useRef(null)
  const pointRef = useRef({ x: -80, y: -80 })
  const sizeRef = useRef({ w: 0, h: 0 })
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [activeId, setActiveId] = useState(null)
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const measure = () => {
      const next = { w: stage.clientWidth, h: stage.clientHeight }
      sizeRef.current = next
      setSize(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const paintCursor = useCallback((x, y) => {
    pointRef.current = { x, y }
    const node = cursorRef.current
    if (!node) return
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [])

  useEffect(() => {
    const move = (event) => paintCursor(event.clientX, event.clientY)
    const hide = () => paintCursor(-80, -80)
    window.addEventListener('pointermove', move)
    window.addEventListener('blur', hide)
    document.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', hide)
      document.removeEventListener('mouseleave', hide)
    }
  }, [paintCursor])

  useEffect(() => {
    const plane = (PLANE * Math.PI) / 180
    let frame = 0
    const loop = () => {
      const { x, y } = pointRef.current
      const hit = x >= 0 ? document.elementFromPoint(x, y) : null
      const hovered = hit instanceof Element ? hit.closest('.planet') : null
      document.querySelectorAll('.planet.is-hot').forEach((el) => {
        if (el !== hovered) el.classList.remove('is-hot')
      })
      if (hovered) hovered.classList.add('is-hot')
      const body = cursorRef.current?.querySelector('.page3-cursor-body')
      if (body) body.classList.toggle('is-hot', Boolean(hovered))

      const turns = performance.now() / 1000 / ORBIT_SECONDS
      const stage = stageRef.current?.getBoundingClientRect()
      document.querySelectorAll('.planet-slot').forEach((slot) => {
        const phase = Number(slot.dataset.phase)
        const angle = phase + turns * Math.PI * 2
        const yr = Math.cos(angle) * Math.sin(plane) + Math.sin(angle) * Math.cos(plane)
        slot.style.zIndex = yr > 0 ? '5' : '2'
        const planet = slot.querySelector('.planet')
        if (!planet || !stage) return
        const rect = planet.getBoundingClientRect()
        const onRight = rect.left + rect.width / 2 > stage.left + stage.width / 2
        planet.classList.toggle('note-left', onRight)
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="page3" aria-label="Page 3">
      <div className="page3-stage" ref={stageRef}>
        <div className="page3-bg" aria-hidden="true" />
        <div className="page3-wine" aria-hidden="true" />
        <div className="page3-depth" aria-hidden="true" />

        {size.w > 0 && (
          <svg className="page3-orbits" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
            {ORBITS.map((orbit) => (
              <ellipse
                key={`${orbit.rx}-${orbit.rot}`}
                cx={size.w / 2}
                cy={size.h * CENTER_Y}
                rx={size.w * orbit.rx}
                ry={size.h * orbit.ry}
                transform={`rotate(${orbit.rot} ${size.w / 2} ${size.h * CENTER_Y})`}
              />
            ))}
          </svg>
        )}

        <div className="rose-wrap">
          <div className="rose-glow" aria-hidden="true" />
          <img className="rose" src={assetUrl('assets/rose.png')} alt="" draggable="false" />
        </div>

        {size.w > 0 &&
          PLANETS.map((planet) => (
            <Planet
              key={planet.id}
              planet={planet}
              radius={size.w * PLANET_PATH.rx}
              squash={(size.h * PLANET_PATH.ry) / (size.w * PLANET_PATH.rx)}
              onOpen={(id) => {
                if (ALBUMS[id]?.length) setActiveId(id)
              }}
            />
          ))}

        <div className="page3-caption">
          <p>轻触小行星，拾起一点回忆。</p>
          <p className="page3-caption-en">be my lover</p>
          <button type="button" className="page3-closer" onClick={() => setCurrentPage(4)}>
            再靠近一点
            <span className="page3-closer-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeId != null && ALBUMS[activeId]?.length > 0 && (
          <MemoryModal
            key={activeId}
            photos={ALBUMS[activeId]}
            onClose={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>

      <div className="page3-cursor" ref={cursorRef} aria-hidden="true">
        <div className="page3-cursor-body" />
      </div>
    </section>
  )
}
