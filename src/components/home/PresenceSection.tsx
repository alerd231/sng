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
    id: 'vladimir',
    region: 'Владимирская область',
    city: 'Владимир',
    x: '16.5%',
    y: '47.4%',
    projects: 1,
    profile: 'Дооснащение ИТСО площадок КС и узлов охраны.',
  },
  {
    id: 'nizhny-novgorod',
    region: 'Нижегородская область',
    city: 'Нижний Новгород',
    x: '20%',
    y: '48.6%',
    projects: 3,
    profile: 'Работы Транснефть Верхняя Волга и подготовке оборудования.',
  },
  {
    id: 'cheboksary',
    region: 'Чувашская Республика',
    city: 'Чебоксары',
    x: '23.7%',
    y: '48.9%',
    projects: 1,
    profile: 'Дооснащение ИТСО на объектах Чебоксарского ЛПУ МГ.',
  },
  {
    id: 'kazan',
    region: 'Республика Татарстан',
    city: 'Казань',
   x: '22.8%',
    y: '51.6%',
    projects: 11,
    profile: 'ГРС, ПНР, автоматизация и дорожные проекты М-7.',
  },
  {
    id: 'izhevsk',
    region: 'Удмуртская Республика',
    city: 'Ижевск',
    x: '26.2%',
    y: '52.8%',
    projects: 1,
    profile: 'Техническое перевооружение контуров телемеханизации МН.',
  },
  {
    id: 'perm',
    region: 'Пермский край',
    city: 'Пермь',
    x: '30.8%',
    y: '52.6%',
    projects: 4,
    profile: 'Монтаж ЛТМ, ИТСО и работы по промышленной инфраструктуре.',
  },
  {
    id: 'ufa',
    region: 'Республика Башкортостан',
    city: 'Уфа',
    x: '23.9%',
    y: '55.6%',
    projects: 1,
    profile: 'Пусконаладка и автоматизация в зоне и транспорта нефти.',
  },
  {
    id: 'kurgan',
    region: 'Курганская область',
    city: 'Курган',
    x: '30.8%',
    y: '56.8%',
    projects: 1,
    profile: 'Доработка схем энергоснабжения и АСУ ТП на ЛПДС.',
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
                className={`group absolute hidden xl:flex ${
                  active
                    ? 'z-[70]'
                    : 'z-20 hover:z-[65] focus-visible:z-[65]'
                }`}
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
                  className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap border px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] backdrop-blur-sm transition-all duration-200 ${
                    active
                      ? 'border-accent/80 bg-black/72 text-white opacity-100 translate-y-0'
                      : 'border-white/25 bg-black/45 text-white/78 opacity-0 translate-y-1 group-hover:border-accent/70 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0'
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
