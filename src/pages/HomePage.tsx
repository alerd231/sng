import { Link } from 'react-router-dom'
import { MainHeroSlider } from '../components/home/MainHeroSlider'
import { PresenceSection } from '../components/home/PresenceSection'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Section } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Divider } from '../components/ui/Divider'
import { StatCounter } from '../components/ui/StatCounter'
import { competencies, documents, projects } from '../data'

export const HomePage = () => {
  const featuredProjects = [...projects]
    .sort((left, right) => right.year - left.year)
    .slice(0, 3)

  const featuredDocuments = [...documents]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 4)

  return (
    <>
      <Seo
        title="Корпоративный профиль"
        description="ООО СтройНефтеГаз: строительно-монтажные работы, ПНР, автоматизация и ТСО/ИТСО для промышленных объектов."
        canonicalPath="/"
      />

      <MainHeroSlider />

      <PresenceSection />

      <Section
        index="02"
        title="Компетенции"
        description="Ключевые производственные направления, подтвержденные завершенными проектами и отраслевой документацией."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {competencies.map((competency, index) => (
            <Reveal key={competency.id} delay={index * 0.05}>
              <Card className="h-full">
                <p className="caption text-muted">{`0${index + 1}`.slice(-2)}</p>
                <h3 className="mt-4 text-lg font-semibold leading-tight text-ink">
                  {competency.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{competency.summary}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        index="03"
        title="Выбранные проекты"
        description="Репрезентативные кейсы 2023-2024 годов по ГРС, ИТСО и дорожной инфраструктуре."
        tone="dark"
      >
        <div className="space-y-4">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.07}>
              <Card dark className="p-0">
                <Link to={`/projects/${project.slug}`} className="block p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="caption text-white/55">{project.year}</p>
                      <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/55">
                      {project.objectType}
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72">
                    {project.excerpt}
                  </p>
                  <Divider dark className="mt-5" />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.58rem] uppercase tracking-[0.2em] text-white/60 sm:text-[0.62rem]">
                    <span>{project.region}</span>
                    <span className="text-accent">Открыть проект →</span>
                  </div>
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="border-y border-white/15 bg-frame py-12 sm:py-16 lg:py-20">
        <div className="container">
          <Reveal>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="caption text-white/55">04</p>
                <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl">
                  Производственные показатели
                </h2>
              </div>
              <span className="caption text-white/45">данные на 2026 год</span>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCounter value={24} suffix="+" label="реализованных проектов" />
            <StatCounter value={11} label="регионов присутствия" />
            <StatCounter value={120} suffix="+" label="специалистов" />
            <StatCounter value={98} suffix="%" label="сдачи в срок" />
          </div>
        </div>
      </section>

      <Section
        index="05"
        title="Документы"
        description="Библиотека учредительных, разрешительных и регламентных документов для закупочных процедур."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {featuredDocuments.map((document, index) => (
            <Reveal key={document.id} delay={index * 0.05}>
              <Card className="h-full p-0">
                <div className="p-5 sm:p-6">
                  <p className="caption text-muted">{document.category}</p>
                  <h3 className="mt-3 text-base font-semibold leading-tight text-ink">
                    {document.title}
                  </h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                    {document.type} · {document.size}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Button to="/documents" variant="secondary" className="w-full sm:w-auto">
            Открыть библиотеку
          </Button>
        </Reveal>
      </Section>
    </>
  )
}
