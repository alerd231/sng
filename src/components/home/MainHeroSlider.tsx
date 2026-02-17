import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Container } from '../layout/Container'
import { Button } from '../ui/Button'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  note: string
  image: string
  metrics: string[]
}

const slides: HeroSlide[] = [
  {
    id: 'slide-construction',
    title: 'Строительно-монтажные работы',
    subtitle: 'на объектах газораспределительной инфраструктуры',
    note: 'Полный цикл работ с техническим контролем и исполнительной документацией.',
    image: '/images/slider1.png',
    metrics: ['ГРС', 'Шеф-монтаж', 'Технологические узлы'],
  },
  {
    id: 'slide-pnr',
    title: 'Пусконаладка и ввод',
    subtitle: 'инженерных контуров в эксплуатацию',
    note: 'Пошаговые программы ПНР, протоколирование и подтверждение проектных параметров.',
    image: '/images/slider2.jpg',
    metrics: ['ПНР', 'Акты и протоколы', 'Сдача по графику'],
  },
  {
    id: 'slide-automation',
    title: 'Автоматизация АСУ ТП / КИПиА',
    subtitle: 'и интеграция ТСО, ИТСО, диспетчерских систем',
    note: 'Единая архитектура управления, мониторинга и эксплуатационной отчетности.',
    image: '/images/slider3.jpg',
    metrics: ['АСУ ТП', 'КИПиА', 'ТСО/ИТСО'],
  },
]

const AUTO_SWITCH_MS = 7000

export const MainHeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  const activeSlide = useMemo(() => slides[activeIndex] ?? slides[0], [activeIndex])

  useEffect(() => {
    if (isPaused || slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, AUTO_SWITCH_MS)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const goTo = (index: number) => {
    const normalized = ((index % slides.length) + slides.length) % slides.length
    setActiveIndex(normalized)
  }

  const goPrevious = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  return (
    <section
      className="relative h-[640px] overflow-hidden border-b border-white/15 bg-graphite text-white sm:h-[700px] lg:h-[760px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeSlide.id}
            src={activeSlide.image}
            alt={activeSlide.title}
            className="h-full w-full object-cover opacity-100"
            loading="eager"
            fetchPriority="high"
            initial={{ opacity: reducedMotion ? 1 : 0.2, scale: reducedMotion ? 1 : 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.15, scale: 1.01 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-graphite/95 via-graphite/82 to-graphite/76" />

      <Container className="relative z-10 flex h-full flex-col py-8 sm:py-10 lg:py-12">
        <p className="caption text-white/62">Репутационный профиль для промышленных проектов</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeSlide.id}-content`}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 grid flex-1 content-start gap-6 lg:mt-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8"
          >
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white/58 sm:text-[0.68rem]">
                {`0${activeIndex + 1}`.slice(-2)} / {`0${slides.length}`.slice(-2)}
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1] sm:text-5xl lg:text-7xl">
                {activeSlide.title}
                <span className="mt-2 block text-white/78">{activeSlide.subtitle}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/76 sm:text-base">
                {activeSlide.note}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 lg:mt-8">
                <Button to="/contacts" dark>
                  Связаться
                </Button>
                <Button to="/projects" variant="secondary" dark>
                  Проекты
                </Button>
                <Button to="/documents" variant="ghost" dark>
                  Документы
                </Button>
              </div>
            </div>

            <div className="hidden border border-white/20 bg-black/25 p-4 sm:p-6 lg:block">
              <p className="caption text-white/55">Контур работ</p>
              <div className="mt-4 space-y-3">
                {activeSlide.metrics.map((metric, index) => (
                  <div key={metric} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm uppercase tracking-[0.14em] text-white/76">{metric}</span>
                    <span className="text-[0.58rem] uppercase tracking-[0.2em] text-accent">
                      {`0${index + 1}`.slice(-2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-2.5 transition-all duration-300 ${
                    isActive ? 'w-10 bg-accent' : 'w-4 bg-white/35 hover:bg-white/60'
                  }`}
                />
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              className="h-10 w-10 border border-white/30 text-sm transition hover:border-accent hover:text-accent"
              aria-label="Предыдущий слайд"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              className="h-10 w-10 border border-white/30 text-sm transition hover:border-accent hover:text-accent"
              aria-label="Следующий слайд"
            >
              →
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}

