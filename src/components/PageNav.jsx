import { useAppStore } from '../store/useAppStore'
import './PageNav.css'

const FIRST = 0
const LAST = 9

export function PageNav() {
  const currentPage = useAppStore((state) => state.currentPage)
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)

  return (
    <div className="page-nav-stage">
      <div className="page-nav-frame">
        <div className="page-nav">
          <button
            type="button"
            className="page-nav-btn"
            aria-label="上一页"
            disabled={currentPage <= FIRST}
            onClick={() => setCurrentPage(Math.max(FIRST, currentPage - 1))}
          >
            ‹
          </button>
          <button
            type="button"
            className="page-nav-btn"
            aria-label="下一页"
            disabled={currentPage >= LAST}
            onClick={() => setCurrentPage(Math.min(LAST, currentPage + 1))}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
