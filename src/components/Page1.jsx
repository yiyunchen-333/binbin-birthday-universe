import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { playBgm } from '../music'
import { useAppStore } from '../store/useAppStore'
import './Page1.css'

export function Page1() {
  const currentPage = useAppStore((state) => state.currentPage)
  const starGone = useAppStore((state) => state.starGone)
  const beginBurst = useAppStore((state) => state.beginBurst)
  const bursting = currentPage === 2

  useEffect(() => {
    if (useAppStore.getState().musicOn) playBgm()
  }, [])

  return (
    <section className={bursting ? 'page1 is-bursting' : 'page1'}>
      <div className="page1-stage">
        <motion.div
          className="page1-bg"
          aria-hidden="true"
          initial={false}
          animate={{
            filter: bursting
              ? [
                  'blur(10px) brightness(0.6) saturate(0.9) contrast(1.04)',
                  'blur(4px) brightness(0.5) saturate(0.55) contrast(1.06)',
                  'blur(2px) brightness(0.42) saturate(0.4) contrast(1.08)',
                ]
              : 'blur(10px) brightness(0.6) saturate(0.9) contrast(1.04)',
          }}
          transition={
            bursting ? { duration: 3.5, times: [0, 0.5 / 3.5, 1], ease: 'linear' } : { duration: 0 }
          }
        />
        <div className="page1-veil" aria-hidden="true" />
        <div className="page1-depth" aria-hidden="true" />

        <div className="page1-cluster">
          <h1 className="page1-headline">
            一个奇迹的诞生，
            <br />
            是这个宇宙的源头。
          </h1>

          <div className="page1-spark-wrap">
            <motion.button
              type="button"
              className={starGone ? 'page1-spark is-gone' : 'page1-spark'}
              aria-label="轻触星光，点亮奇迹"
              onClick={(event) => {
                event.currentTarget.style.opacity = '0'
                event.currentTarget.style.visibility = 'hidden'
                event.currentTarget.style.display = 'none'
                beginBurst()
              }}
              animate={starGone ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0 }}
              style={{ pointerEvents: starGone ? 'none' : 'auto' }}
            >
              {!starGone && (
                <span className="page1-star">
                  <motion.span
                    className="page1-star-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
                  >
                    <motion.span
                      className="page1-star-axis page1-star-axis-v"
                      animate={{ scaleY: [0.52, 1, 0.52] }}
                      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="page1-star-axis page1-star-axis-h"
                      animate={{ scaleX: [1, 0.52, 1] }}
                      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="page1-star-corners" />
                    <span className="page1-star-core" />
                  </motion.span>
                  <motion.span
                    className="page1-orbit"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className="page1-orbit-trail" />
                  </motion.span>
                </span>
              )}
            </motion.button>
          </div>

          <div className="page1-captions" aria-hidden={bursting}>
            <p className="page1-hint">轻触星光，亲手点亮属于我们的奇迹。</p>
            <p className="page1-hint-en">
              Touch the starlight, and kindle our miracle with your own hands.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
