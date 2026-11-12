import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assetUrl } from '../assetUrl'
import { useAppStore } from '../store/useAppStore'
import './Page0.css'

const ANSWERS = new Set(['猪', '小猪鸡', '小（猪）鸡', '小(猪)鸡'])
const SFX = {
  bingo: assetUrl('sfx-correct.mp3'),
  no: assetUrl('sfx-wrong.mp3'),
}

function normalize(value) {
  return value.replace(/\s+/g, '').trim()
}

export function Page0() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const [blank, setBlank] = useState('')
  const [result, setResult] = useState(null)
  const sfxRef = useRef(null)

  const playSfx = (src) => {
    sfxRef.current?.pause()
    const audio = new Audio(src)
    audio.volume = 0.95
    sfxRef.current = audio
    audio.play()?.catch(() => {})
    return audio
  }

  const submit = (event) => {
    event.preventDefault()
    const filled = normalize(blank)
    const whole = `小（${filled}）鸡`
    const ok = ANSWERS.has(filled) || ANSWERS.has(whole)
    setResult(ok ? 'bingo' : 'no')
    const audio = playSfx(ok ? SFX.bingo : SFX.no)
    if (!ok) return
    let gone = false
    const go = () => {
      if (gone) return
      gone = true
      setCurrentPage(1)
    }
    audio.addEventListener('ended', () => window.setTimeout(go, 400), { once: true })
    window.setTimeout(go, 2200)
  }

  return (
    <section className="page0" aria-label="Page 0">
      <div className="page0-stage">
        <div className="page0-bg" aria-hidden="true" />
        <div className="page0-dim" aria-hidden="true" />

        <form className="page0-card" onSubmit={submit}>
          <p className="page0-kicker">验证通过：</p>
          <p className="page0-question">彬彬给他女朋友取的第二个昵称是什么？</p>
          <p className="page0-blank">
            小（
            <input
              className="page0-input"
              value={blank}
              onChange={(event) => {
                setBlank(event.target.value)
                if (result === 'no') setResult(null)
              }}
              maxLength={8}
              autoComplete="off"
              aria-label="填空"
              disabled={result === 'bingo'}
            />
            ）鸡
          </p>
          <button type="submit" className="page0-submit" disabled={result === 'bingo'}>
            提交
          </button>

          <AnimatePresence mode="wait">
            {result === 'bingo' && (
              <motion.p
                key="bingo"
                className="page0-result is-bingo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                BINGO！！！我的小兔鸡！！
              </motion.p>
            )}
            {result === 'no' && (
              <motion.p
                key="no"
                className="page0-result is-no"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                NONONO！！你是冒牌货！！请在真彬彬的陪同下一同观看
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  )
}
