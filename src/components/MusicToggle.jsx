import { pauseBgm, playBgm } from '../music'
import { useAppStore } from '../store/useAppStore'
import './MusicToggle.css'

export function MusicToggle() {
  const musicOn = useAppStore((state) => state.musicOn)
  const currentPage = useAppStore((state) => state.currentPage)
  const toggleMusic = useAppStore((state) => state.toggleMusic)

  if (currentPage < 1) return null

  return (
    <div className="music-toggle-stage">
      <div className="music-toggle-frame">
        <p className="music-toggle">
          MUSIC{' '}
          <button
            type="button"
            className="music-toggle-state"
            onClick={(event) => {
              event.stopPropagation()
              if (musicOn) {
                pauseBgm()
                toggleMusic()
              } else {
                toggleMusic()
                playBgm()
              }
            }}
          >
            {musicOn ? 'ON' : 'OFF'}
          </button>
        </p>
      </div>
    </div>
  )
}
