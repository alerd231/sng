import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Lightbox } from '../components/ui/Lightbox'
import { competencies, projects } from '../data'

export const ProjectDetailPage = () => {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const relatedCompetencies = useMemo(
    () =>
      competencies.filter((competency) =>
        project?.relatedCompetencyIds.includes(competency.id),
      ),
    [project],
  )

  if (!project) {
    return <Navigate to="/404" replace />
  }

  const passportRows = [
    { label: 'Период', value: project.passport.period },
    { label: 'Статус', value: project.passport.status },
    { label: 'Заказчик', value: project.passport.customer },
    { label: 'Исполнитель', value: project.passport.contractor },
    { label: 'ИНН исполнителя', value: project.passport.inn },
    { label: 'Локация', value: project.passport.location },
    { label: 'Тип объекта', value: project.passport.objectType },
    { label: 'Объем работ', value: project.passport.workScope },
  ]

  return (
    <>
      <Seo
        title={project.title}
        description={project.excerpt}
        canonicalPath={`/projects/${project.slug}`}
      />

      <section className="relative overflow-hidden border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
        <img
          src={project.heroImage}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/92 via-graphite/86 to-graphite/80" />
        <Container className="relative z-10">
          <Reveal>
            <Breadcrumbs
              dark
              items={[
                { label: 'Главная', to: '/' },
                { label: 'Проекты', to: '/projects' },
                { label: project.title },
              ]}
            />
            <p className="caption mt-6 text-white/58">{project.year}</p>
            <h1 className="mt-4 max-w-5xl text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/74">
              {project.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.workTypes.map((workType) => (
                <span
                  key={workType}
                  className="border border-white/25 px-3 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/75"
                >
                  {workType}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <Section
        index="01"
        title="Паспорт проекта"
        description="Сводные сведения для тендерной и технической верификации."
      >
        <div className="border border-ink/15 bg-white">
          {passportRows.map((row) => (
            <div
              key={row.label}
              className="grid border-b border-ink/10 px-4 py-4 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-5"
            >
              <p className="caption text-muted">{row.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink sm:mt-0">{row.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        index="02"
        title="Задачи, решения, результат"
        description="Логика выполнения проекта в формате технического отчета."
        tone="dark"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <Card dark>
            <p className="caption text-white/50">Задачи</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
              {project.tasks.map((task) => (
                <li key={task} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card dark>
            <p className="caption text-white/50">Решения</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
              {project.solutions.map((solution) => (
                <li key={solution} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card dark>
            <p className="caption text-white/50">Результат</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
              {project.results.map((result) => (
                <li key={result} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{result}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        index="03"
        title="Документы и подтверждения"
        description="Набор материалов, сопровождающих закрытие проекта."
      >
        <div className="space-y-3">
          {project.files.length ? (
            project.files.map((file) => (
              <Card key={file.name} className="p-0">
                <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-ink">{file.name}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                      {file.type} · {file.size}
                    </p>
                  </div>
                  <Button href={file.url} variant="secondary" target="_blank" rel="noreferrer">
                    Скачать
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-muted">Файлы не приложены.</p>
            </Card>
          )}
        </div>
      </Section>

      <Section
        index="04"
        title="Связанные компетенции"
        description="Профессиональные блоки, задействованные в реализации проекта."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {relatedCompetencies.map((item) => (
            <Card key={item.id}>
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/projects" variant="secondary">
            К списку проектов
          </Button>
          <Button to="/contacts" variant="primary">
            Обсудить проект
          </Button>
        </div>
      </Section>

      <section className="bg-frame py-14 text-white lg:py-18">
        <Container>
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="caption text-white/55">05</p>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Галерея проекта</h2>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((image, index) => (
              <Reveal key={image} delay={index * 0.05}>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index)
                    setLightboxOpen(true)
                  }}
                  className="group relative overflow-hidden border border-white/25"
                  aria-label={`Открыть изображение ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${project.title} - изображение ${index + 1}`}
                    className="h-56 w-full object-cover transition duration-500 ease-smooth group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/80">
                    Открыть
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Lightbox
        open={lightboxOpen}
        images={project.gallery}
        startIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        altPrefix={project.title}
      />
    </>
  )
}
