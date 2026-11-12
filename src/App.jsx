import { AnimatePresence, motion } from 'framer-motion'
import { Page0 } from './components/Page0'
import { Page1 } from './components/Page1'
import { Page2 } from './components/Page2'
import { Page3 } from './components/Page3'
import { Page4 } from './components/Page4'
import { Page5 } from './components/Page5'
import { Page6 } from './components/Page6'
import { Page7 } from './components/Page7'
import { Page8 } from './components/Page8'
import { Page9 } from './components/Page9'
import { BackgroundMusic } from './components/BackgroundMusic'
import { MusicToggle } from './components/MusicToggle'
import { PageNav } from './components/PageNav'
import { useAppStore } from './store/useAppStore'
import './App.css'

const crossfade = { duration: 1, ease: 'easeInOut' }
const closer = { duration: 1.15, ease: [0.4, 0, 0.2, 1] }

function App() {
  const currentPage = useAppStore((state) => state.currentPage)

  return (
    <main className="app-shell">
      <BackgroundMusic />
      <MusicToggle />
      <PageNav />
      <AnimatePresence mode="sync">
        {currentPage === 0 && (
          <motion.div
            key="page0-layer"
            className="app-layer app-layer-page0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={crossfade}
          >
            <Page0 />
          </motion.div>
        )}
        {currentPage > 0 && currentPage < 3 && (
          <motion.div
            key="burst-layer"
            className="app-layer"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={crossfade}
          >
            <Page1 />
            {currentPage === 2 && <Page2 />}
          </motion.div>
        )}
        {currentPage === 3 && (
          <motion.div
            key="page3-layer"
            className="app-layer app-layer-page3"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={closer}
          >
            <Page3 />
          </motion.div>
        )}
        {currentPage === 4 && (
          <motion.div
            key="page4-layer"
            className="app-layer app-layer-page4"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={closer}
          >
            <Page4 />
          </motion.div>
        )}
        {currentPage === 5 && (
          <motion.div
            key="page5-layer"
            className="app-layer app-layer-page5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Page5 />
          </motion.div>
        )}
        {currentPage === 6 && (
          <motion.div
            key="page6-layer"
            className="app-layer app-layer-page6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Page6 />
          </motion.div>
        )}
        {currentPage === 7 && (
          <motion.div
            key="page7-layer"
            className="app-layer app-layer-page7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Page7 />
          </motion.div>
        )}
        {currentPage === 8 && (
          <motion.div
            key="page8-layer"
            className="app-layer app-layer-page8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Page8 />
          </motion.div>
        )}
        {currentPage === 9 && (
          <motion.div
            key="page9-layer"
            className="app-layer app-layer-page9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Page9 />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
