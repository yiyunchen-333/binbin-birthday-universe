import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '../store/useAppStore'
import { WarpEffect } from './WarpEffect'
import './Page4.css'

const HOLD_MS = 1500
const RING_RADIUS = 13.6
const MOTES = [
  { angle: '16deg', reach: '24px', life: '4.6s', delay: '1.15s', size: '1px', peak: 0.46 },
  { angle: '78deg', reach: '26px', life: '5.4s', delay: '2.4s', size: '1.15px', peak: 0.38 },
  { angle: '141deg', reach: '22px', life: '4.1s', delay: '1.7s', size: '1px', peak: 0.42 },
  { angle: '207deg', reach: '27px', life: '5.8s', delay: '3.3s', size: '1.25px', peak: 0.34 },
  { angle: '258deg', reach: '24px', life: '4.8s', delay: '2.05s', size: '1.1px', peak: 0.4 },
  { angle: '321deg', reach: '25px', life: '5.2s', delay: '3.9s', size: '1px', peak: 0.36 },
]

export function Page4() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [warping, setWarping] = useState(false)
  const [centerGone, setCenterGone] = useState(false)
  const progressRef = useRef(0)
  const holdingRef = useRef(false)
  const doneRef = useRef(false)
  const frameRef = useRef(0)
  const lastRef = useRef(0)

  const stopFrame = () => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    lastRef.current = 0
  }

  const step = (now) => {
    if (!lastRef.current) lastRef.current = now
    const delta = now - lastRef.current
    lastRef.current = now

    if (holdingRef.current) {
      progressRef.current = Math.min(1, progressRef.current + delta / HOLD_MS)
      if (progressRef.current >= 1 && !doneRef.current) {
        doneRef.current = true
        holdingRef.current = false
        progressRef.current = 1
        setHolding(false)
        setProgress(1)
        setWarping(true)
        stopFrame()
        return
      }
    } else {
      progressRef.current = Math.max(0, progressRef.current - delta / HOLD_MS)
      if (progressRef.current <= 0) {
        progressRef.current = 0
        setProgress(0)
        stopFrame()
        return
      }
    }

    setProgress(progressRef.current)
    frameRef.current = requestAnimationFrame(step)
  }

  const ensureFrame = () => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(step)
  }

  useEffect(
    () => () => {
      stopFrame()
    },
    [],
  )

  useEffect(() => {
    if (!warping) return undefined
    setCenterGone(true)
  }, [warping])

  const press = (event) => {
    if (doneRef.current) return
    event.preventDefault()
    holdingRef.current = true
    setHolding(true)
    ensureFrame()
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // A pointer that is already gone cannot be captured.
    }
  }

  const release = (event) => {
    if (doneRef.current) return
    if (event?.type === 'pointerleave' && event.buttons > 0) return
    holdingRef.current = false
    setHolding(false)
    if (progressRef.current > 0) ensureFrame()
  }

  const glowOpacity = 0.2 * (1 - Math.exp(-progress * 14)) + progress * 0.28
  const dotStyle = {
    transform: `scale(${1 + progress * 0.85})`,
    filter: progress > 0 ? `brightness(${1 + progress * 0.45})` : undefined,
    boxShadow:
      progress > 0
        ? `0 0 ${2 + progress * 6}px ${progress * 2}px rgba(255,255,255,${0.28 + progress * 0.5})`
        : undefined,
  }
  const glowStyle = {
    transform: `scale(${1 + progress * 0.45})`,
    opacity: glowOpacity,
  }

  return (
    <section className="page4" aria-label="Page 4">
      <div className="page4-stage">
        <div className="page4-bg" aria-hidden="true" />
        <div className="page4-dim" aria-hidden="true" />

        <div className={warping ? 'page4-copy is-gone' : 'page4-copy'}>
          <p className="page4-kicker">SOMEWHERE, A WORLD IS WAITING FOR YOU</p>
          <div className="page4-title-block">
            <h1>
              想带你
              <br />
              去一个地方
            </h1>
            <p className="page4-sub">somewhere only we know.</p>
          </div>
          <div className="page4-foot">
            <p>按住微光，让星光为你加速</p>
            <p className="page4-foot-en">hold to gather the stars · release to fly</p>
          </div>
        </div>

        <button
          type="button"
          className={centerGone ? 'page4-hold is-dim' : 'page4-hold'}
          aria-label="按住微光，让星光为你加速"
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onContextMenu={(event) => event.preventDefault()}
        >
          <motion.span
            className="page4-ripple"
            aria-hidden="true"
            initial={{ scale: 0.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.62 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            className="page4-ripple page4-ripple-echo"
            aria-hidden="true"
            initial={{ scale: 0.12, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.38, 0] }}
            transition={{ duration: 2.8, delay: 0.45, ease: [0.16, 1, 0.3, 1], times: [0, 0.42, 1] }}
          />
          <svg className="page4-ring" viewBox="0 0 32 32" aria-hidden="true">
            <circle className="page4-ring-track" cx="16" cy="16" r={RING_RADIUS} />
            <circle
              className="page4-ring-value"
              cx="16"
              cy="16"
              r={RING_RADIUS}
              strokeWidth={0.5 + progress * 0.4}
              stroke={`rgba(255, 246, 248, ${0.26 + progress * 0.62})`}
              strokeDasharray={2 * Math.PI * RING_RADIUS}
              strokeDashoffset={2 * Math.PI * RING_RADIUS * (1 - progress)}
              transform="rotate(-90 16 16)"
            />
          </svg>
          <span
            className={holding || progress > 0 ? 'page4-motes is-quiet' : 'page4-motes'}
            aria-hidden="true"
          >
            {MOTES.map((mote) => (
              <span
                key={mote.angle}
                className="page4-mote"
                style={{
                  '--angle': mote.angle,
                  '--reach': mote.reach,
                  '--life': mote.life,
                  '--delay': mote.delay,
                  '--size': mote.size,
                  '--peak': mote.peak,
                }}
              />
            ))}
          </span>
          <span className={holding ? 'page4-glow is-holding' : 'page4-glow'} style={glowStyle} />
          <span className="page4-dot" style={dotStyle} />
        </button>
        {warping &&
          createPortal(
            <WarpEffect onDone={() => setCurrentPage(5)} />,
            document.body,
          )}
      </div>
    </section>
  )
}
