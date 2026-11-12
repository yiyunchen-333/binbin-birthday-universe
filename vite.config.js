import { copyFileSync, existsSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function copyNebulaBackground() {
  const root = process.cwd()
  const dest = join(root, 'public', 'background-image.jpg')
  const match = readdirSync(root).find((name) => {
    const ext = extname(name).toLowerCase()
    const base = name.slice(0, -ext.length).toLowerCase()
    return (
      ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) &&
      (base === 'background image' || base === 'background-image')
    )
  })

  if (match) {
    copyFileSync(join(root, match), dest)
    return
  }

  const publicMatch = join(root, 'public', 'background image.jpg')
  if (existsSync(publicMatch)) {
    copyFileSync(publicMatch, dest)
  }
}

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'copy-nebula-background',
      buildStart: copyNebulaBackground,
      configureServer() {
        copyNebulaBackground()
      },
    },
    react(),
  ],
})
