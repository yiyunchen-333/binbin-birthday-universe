import { useEffect, useRef } from 'react'
import { getBgm, pauseBgm, playBgm, restartBgm, rewindPlaylist } from '../music'
import { useAppStore } from '../store/useAppStore'

function startBgm() {
  if (!useAppStore.getState().musicOn) return
  if (useAppStore.getState().currentPage < 1) return
  playBgm()
}

export function BackgroundMusic() {
  const musicOn = useAppStore((state) => state.musicOn)
  const currentPage = useAppStore((state) => state.currentPage)
  const previousPage = useRef(currentPage)

  useEffect(() => {
    getBgm()
    if (useAppStore.getState().currentPage < 1) {
      pauseBgm()
      rewindPlaylist()
    } else {
      startBgm()
    }
  }, [])

  useEffect(() => {
    if (currentPage === 0) {
      pauseBgm()
      rewindPlaylist()
    } else if (currentPage === 1 && previousPage.current !== 1) {
      if (useAppStore.getState().musicOn) restartBgm()
      else rewindPlaylist()
    }
    previousPage.current = currentPage
  }, [currentPage])

  useEffect(() => {
    const unlock = () => {
      if (!useAppStore.getState().musicOn) return
      if (useAppStore.getState().currentPage < 1) return
      const track = getBgm()
      if (!track.paused && !track.ended) return
      playBgm()
    }
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('click', unlock, true)
    window.addEventListener('keydown', unlock, true)
    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('click', unlock, true)
      window.removeEventListener('keydown', unlock, true)
    }
  }, [])

  useEffect(() => {
    if (!musicOn) pauseBgm()
  }, [musicOn])

  return null
}
