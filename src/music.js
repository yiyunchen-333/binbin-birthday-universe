import { assetUrl } from './assetUrl'
import { useAppStore } from './store/useAppStore'

const TRACKS = [assetUrl('bgm.mp3'), assetUrl('bgm-2.mp3')]

let playlist
let index = 0
let switching = false

function stopOthers(current) {
  playlist.forEach((audio, trackIndex) => {
    if (trackIndex === current) return
    audio.pause()
    audio.currentTime = 0
  })
}

function getPlaylist() {
  if (!playlist) {
    playlist = TRACKS.map((src, trackIndex) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.loop = false
      audio.volume = 0.85
      audio.addEventListener('ended', () => {
        if (!useAppStore.getState().musicOn) return
        if (switching) return
        switching = true
        audio.currentTime = 0
        index = (trackIndex + 1) % TRACKS.length
        playBgm()
        window.setTimeout(() => {
          switching = false
        }, 80)
      })
      return audio
    })
  }
  return playlist
}

export function getBgm() {
  return getPlaylist()[index]
}

export function playBgm() {
  const tracks = getPlaylist()
  stopOthers(index)
  const track = tracks[index]
  track.muted = false
  track.volume = 0.85
  if (track.ended || track.currentTime >= (track.duration || 1) - 0.08) {
    track.currentTime = 0
  }
  const start = track.play()
  if (start?.catch) start.catch(() => {})
}

export function pauseBgm() {
  getPlaylist().forEach((audio) => audio.pause())
}

export function rewindPlaylist() {
  index = 0
  switching = false
  getPlaylist().forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}

export function restartBgm() {
  rewindPlaylist()
  playBgm()
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    playlist?.forEach((audio) => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    })
    playlist = undefined
    index = 0
    switching = false
  })
}
