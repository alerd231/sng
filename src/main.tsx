import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { IntroPreloader } from './components/layout/IntroPreloader'
import './index.css'

const INTRO_DURATION_MS = 2200
const INTRO_DURATION_REDUCED_MS = 420

const RootApp = () => {
  const [introOpen, setIntroOpen] = useState(true)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduceMotion ? INTRO_DURATION_REDUCED_MS : INTRO_DURATION_MS

    const timer = window.setTimeout(() => {
      setIntroOpen(false)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!introOpen) {
      return
    }

    const { style: htmlStyle } = document.documentElement
    const { style: bodyStyle } = document.body
    const previousHtmlOverflow = htmlStyle.overflow
    const previousBodyOverflow = bodyStyle.overflow

    htmlStyle.overflow = 'hidden'
    bodyStyle.overflow = 'hidden'

    return () => {
      htmlStyle.overflow = previousHtmlOverflow
      bodyStyle.overflow = previousBodyOverflow
    }
  }, [introOpen])

  return (
    <>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
      <IntroPreloader open={introOpen} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
