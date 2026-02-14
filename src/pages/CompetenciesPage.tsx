import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { Tabs, type TabItem } from '../components/ui/Tabs'
import { competencies, projects } from '../data'

const groupLabels = {
  construction: 'Строительно-монтажный блок',
  commissioning: 'Пусконаладка',
  automation: 'Автоматизация',
  security: 'ТСО/ИТСО',
}

const groupedCompetencies = Object.entries(groupLabels).map(([group, label]) => ({
  group,
  label,
  items: competencies.filter((competency) => competency.group === group),
}))

const relatedProjects = projects.slice(0, 4)

export const CompetenciesPage = () => {
  const tabs: TabItem[] = groupedCompetencies.map(({ group, label, items }) => ({
    id: group,
    label,
    content: (
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="h-full">
            <h3 className="text-lg font-semibold leading-tight text-ink">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink/85">
              {item.services.map((service) => (
                <li key={service} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    ),
  }))

  return (
    <>
      <Seo
        title="Компетенции"
        description="Ключевые компетенции СтройНефтеГаз: СМР, ПНР, автоматизация и ТСО/ИТСО."
        canonicalPath="/competencies"
      />

      <section className="border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
        <Container>
          <Reveal>
            <Breadcrumbs
              dark
              items={[{ label: 'Главная', to: '/' }, { label: 'Компетенции' }]}
            />
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Производственные компетенции
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/72">
              Компания ведет проекты в единой инженерной логике: от монтажа до
              испытаний, автоматизации и передачи исполнительной документации.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section
        index="01"
        title="Направления"
        description="Структура компетенций по ключевым производственным блокам."
      >
        <Tabs items={tabs} />
      </Section>

      <Section
        index="02"
        title="Проекты, связанные с компетенциями"
        description="Примеры реализованных проектов с подтвержденным результатом."
        tone="dark"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {relatedProjects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.07}>
              <Card dark className="h-full p-0">
                <Link to={`/projects/${project.slug}`} className="block p-6">
                  <p className="caption text-white/50">{project.year}</p>
                  <h3 className="mt-3 text-lg font-semibold leading-tight">{project.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">{project.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.2em] text-white/55">
                    <span>{project.objectType}</span>
                    <span className="text-accent">Открыть →</span>
                  </div>
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}
