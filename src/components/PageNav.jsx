import { useAppStore } from '../store/useAppStore'
import './PageNav.css'

const LAST = 9

export function PageNav() {
  const currentPage = useAppStore((state) => state.currentPage)
  const quizPassed = useAppStore((state) => state.quizPassed)
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const first = quizPassed ? 0 : 1
  const page0Locked = currentPage === 0 && !quizPassed

  return (
    <div className="page-nav-stage">
      <div className="page-nav-frame">
        <div className="page-nav">
          <button
            type="button"
            className="page-nav-btn"
            aria-label="上一页"
            disabled={page0Locked || currentPage <= first}
            onClick={() => {
              if (page0Locked) return
              setCurrentPage(Math.max(first, currentPage - 1))
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="page-nav-btn"
            aria-label="下一页"
            disabled={page0Locked || currentPage >= LAST}
            onClick={() => {
              if (page0Locked) return
              setCurrentPage(Math.min(LAST, currentPage + 1))
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
