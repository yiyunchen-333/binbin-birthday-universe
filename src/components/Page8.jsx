import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import './Page8.css'

export function Page8() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const scrollRef = useRef(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return undefined
    node.focus({ preventScroll: true })

    let target = node.scrollTop
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
        event.deltaMode === 1 ? event.deltaY * 18 : event.deltaMode === 2 ? event.deltaY * node.clientHeight : event.deltaY
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
  }, [])

  return (
    <section className="page8" aria-label="Page 8">
      <div className="page8-stage">
        <div className="page8-bg" aria-hidden="true" />
        <div className="page8-dim" aria-hidden="true" />

        <div className="page8-scroll" ref={scrollRef} tabIndex={-1}>
          <article className="page8-letter">
            <p className="page8-salute">
              Dear<span>彬彬：</span>
            </p>

            <p>没想到吧！居然在这里和我的小彬见面了。</p>

            <p>
              首先，先隆重地，并且由衷地，祝我的宝宝彬 20 岁生日快乐！我的彬彬兔宝宝迎来了自己人生的新阶段，正是步入二字头的人生了！
            </p>

            <p>
              说来也神奇，明明在 7 个多月以前，你还是一个高冷，从未接近到的暗恋的男生，甚至可以说是陌生人，但现在，却让我心甘情愿地付出一切的爱人。
            </p>

            <p>
              在高中的时候，我特别喜欢看散文，林清玄的《持续做一个深情的人》，让那时的我，不禁憧憬着那份彼此怜爱，彼此坦诚，彼此成就，彼此挂念的真爱出现在我的生命里。而如今，我遇到了你。感谢你对我无微不至的关怀，感谢你在我需要你的时候，给我一个消融掉一切不适的拥抱；感谢你对我付出的所有真心，我永远都铭记在心。
            </p>

            <p>
              语言始终是情感表达的其中一种工具，我想我没有办法一下子准确无误地告诉你我有多爱你。我爱你，就像爱生命。如果这个世界有可以让我们生生世世而做情人，做夫妻，我一定要向造物主一遍一遍祈祷，我愿意在每一次来到地球体验爱的时候，都遇到你。可能你下辈子不叫陈文彬了，但我敢肯定，我的感受会比我的大脑先认出你，就像我和你初相遇之时，那股强烈的一见如故的感觉告诉我：或许我以前见过你。
            </p>

            <p>
              我爱你的所有。你的眼睛，和琥珀一样，清透，又凝结着沉稳。你的眼睛，鼻子嘴巴，明明一直带着男性特有的犀利，但在对着我笑的时候好像，又变成了某种很坚定的力量，守护着你对我的爱。甚至你腿上被烫伤的疤痕，我都会觉得像博物馆里被展览出来，被大家欣赏的文物，上面的花纹，独一无二的美，无可替代，但听着你小时候的故事，又觉你十分可爱！彬彬就是我的小活宝～
            </p>

            <p>
              好吧，不知道为啥，一封生日祝福信又变成了一封表白信。可能是因为他们的性质本就相同吧，都是爱你的产物。
            </p>

            <p>
              虽然现在仍不能想给这封信做结尾，但想先给我最疼爱的彬彬兔宝送上我的祝福！首先，祝你在新的一岁，以及以后，都身体健健康康，平平安安的，祝你在以后你喜欢的运动里能继续开开心心地做自己，祝你的膝盖，你的身体和你也像我和你一样，相互疼爱，相互成就，继续再无条件地支持彼此在篮球中找到原始的真正的快乐！祝你在以后的生活里，不管是开心的，不开心的，激烈热烈的，亦或平淡的，都好好享受，好好体验，你所感受到的自己，无需隐藏，无需逃避，因为这些都是你生命中十分珍贵的礼物，你永远是我心目中那只最特别，最可爱的兔鸡彬！
            </p>

            <p>
              最后祝我们的感情，变成我们共同酿制的葡萄酒，珍藏越久越醇香。祝我们都能相互支持，相互给予，相互怜爱，相互依靠，祝我们越来越好。
            </p>

            <p className="page8-sign">
              你的爱人
              <span>陈艺允</span>
              <span>2026.11.11</span>
            </p>
          </article>

          <button type="button" className="page8-more" onClick={() => setCurrentPage(9)}>
            one more thing
            <span className="page8-more-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
