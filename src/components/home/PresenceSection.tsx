import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Section } from '../layout/Section'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface PresenceLocation {
  id: string
  region: string
  city: string
  x: string
  y: string
  projects: number
  profile: string
}

const locations: PresenceLocation[] = [
  {
    id: 'moscow',
    region: 'Центральный офис',
    city: 'Москва',
    x: '20%',
    y: '45%',
    projects: 5,
    profile: 'Координация проектов и контрактный блок',
  },
  {
    id: 'kazan',
    region: 'Операционный контур',
    city: 'Казань',
    x: '26%',
    y: '51%',
    projects: 9,
    profile: 'Строительно-монтажные работы и ПНР',
  },
  {
    id: 'cheboksary',
    region: 'ИТСО и безопасность',
    city: 'Чебоксары',
    x: '33%',
    y: '57%',
    projects: 4,
    profile: 'Дооснащение ТСО/ИТСО и эксплуатационный мониторинг',
  },
  {
    id: 'tyumen',
    region: 'Северный контур',
    city: 'Тюмень',
    x: '41%',
    y: '54%',
    projects: 7,
    profile: 'Автоматизация и наладка технологических узлов',
  },
  {
    id: 'novy-urengoy',
    region: 'Ямало-Ненецкий АО',
    city: 'Новый Уренгой',
    x: '45%',
    y: '43%',
    projects: 6,
    profile: 'Объекты газовой инфраструктуры и шеф-монтаж',
  },
  {
    id: 'samara',
    region: 'Транспортная инфраструктура',
    city: 'Самара',
    x: '34%',
    y: '52%',
    projects: 3,
    profile: 'Инженерные системы дорожных объектов',
  },
]

export const PresenceSection = () => {
  const [activeId, setActiveId] = useState(locations[0]?.id ?? '')

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === activeId) ?? locations[0],
    [activeId],
  )

  return (
    <Section
      index="01"
      title="География присутствия"
      description="Проектные команды работают в ключевых промышленных регионах с единым инженерным стандартом и централизованной отчетностью."
      desktopSplit={false}
    >
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="relative min-h-[280px] overflow-hidden border border-ink/15 bg-gradient-to-br from-[#1b1f25] via-[#13161c] to-[#101318] p-4 sm:min-h-[360px] sm:p-6">
          <img
            src="/images/presence-map.png"
            alt="Карта присутствия"
            className="absolute inset-0 h-full w-full object-contain p-3 sm:p-6"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />

          {locations.map((location, index) => {
            const active = location.id === activeLocation.id

            return (
              <button
                key={location.id}
                type="button"
                aria-label={`${location.region}: ${location.city}`}
                onMouseEnter={() => setActiveId(location.id)}
                onFocus={() => setActiveId(location.id)}
                onClick={() => setActiveId(location.id)}
                className="group absolute z-20 hidden md:flex"
                style={{ left: location.x, top: location.y }}
              >
                <motion.span
                  className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    active ? 'bg-accent/35' : 'bg-accent/20'
                  }`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.2, 0.55] }}
                  transition={{ duration: 2.2 + index * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-[0_0_0_4px_rgba(0,0,0,0.25)] transition ${
                    active
                      ? 'border-accent bg-accent'
                      : 'border-white/90 bg-white group-hover:border-accent group-hover:bg-accent'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap border px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] backdrop-blur-sm transition ${
                    active
                      ? 'border-accent/80 bg-black/72 text-white'
                      : 'border-white/25 bg-black/45 text-white/72 group-hover:border-accent/70 group-hover:text-white text-white text-opacity-25'
                  }`}
                >
                  {location.city}
                </span>
              </button>
            )
          })}

          <div className="absolute bottom-4 left-4 right-4 border border-white/15 bg-black/40 p-3 sm:bottom-6 sm:left-6 sm:right-6">
            <p className="caption text-white text-opacity-55">Активная площадка</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-white/75">{activeLocation.region}</p>
                <p className="mt-1 text-xl font-semibold text-white">{activeLocation.city}</p>
              </div>
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-accent">
                {activeLocation.projects} проектов
              </p>
            </div>
          </div>
        </div>

        <Card className="h-full bg-white">
          <p className="caption text-muted">Паспорт присутствия</p>
          <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">11+ регионов проектной деятельности</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">{activeLocation.profile}</p>

          <div className="mt-5 space-y-3 border-t border-ink/10 pt-4">
            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => setActiveId(location.id)}
                className={`flex w-full items-center justify-between border px-3 py-3 text-left text-sm transition ${
                  location.id === activeLocation.id
                    ? 'border-accent bg-accent/5 text-ink'
                    : 'border-ink/15 text-muted hover:border-ink/35'
                }`}
              >
                <span>
                  <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                    {location.region}
                  </span>
                  <span className="mt-1 block font-medium text-ink ">{location.city}</span>
                </span>
                <span className="text-[0.58rem] uppercase tracking-[0.2em] text-accent">
                  {location.projects}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/projects" variant="secondary" className="w-full sm:w-auto">
              Проекты по регионам
            </Button>
            <Link
              to="/contacts"
              className="inline-flex h-12 w-full items-center justify-center border border-ink/20 px-6 text-[0.62rem] uppercase tracking-[0.2em] text-ink transition hover:border-accent sm:w-auto"
            >
              Запросить презентацию
            </Link>
          </div>
        </Card>
      </div>
    </Section>
  )
}
