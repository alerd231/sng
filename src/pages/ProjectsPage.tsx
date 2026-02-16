import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { FiltersBar } from '../components/ui/FiltersBar'
import { experience } from '../data'
import { usePublicProjects } from '../hooks/usePublicCollections'
import { uniqueValues } from '../utils/collections'
import { setParam } from '../utils/searchParams'

const selectClassName =
  'h-12 border border-ink/20 bg-white px-5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const labelClassName = 'flex flex-col gap-3 px-2'

export const ProjectsPage = () => {
  const { data: projects, error: projectsError } = usePublicProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const experienceRows = useMemo(
    () => [...experience].sort((left, right) => right.year - left.year),
    [],
  )

  const filters = {
    objectType: searchParams.get('objectType') ?? '',
    workType: searchParams.get('workType') ?? '',
    region: searchParams.get('region') ?? '',
    year: searchParams.get('year') ?? '',
  }

  const options = useMemo(() => {
    const objectTypes = uniqueValues(projects.map((project) => project.objectType))
    const workTypes = uniqueValues(projects.flatMap((project) => project.workTypes))
    const regions = uniqueValues(projects.map((project) => project.region))
    const years = uniqueValues(projects.map((project) => String(project.year))).sort(
      (left, right) => Number(right) - Number(left),
    )

    return {
      objectTypes,
      workTypes,
      regions,
      years,
    }
  }, [projects])

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project) => {
          if (filters.objectType && project.objectType !== filters.objectType) {
            return false
          }

          if (filters.workType && !project.workTypes.includes(filters.workType)) {
            return false
          }

          if (filters.region && project.region !== filters.region) {
            return false
          }

          if (filters.year && String(project.year) !== filters.year) {
            return false
          }

          return true
        })
        .sort((left, right) => right.year - left.year),
    [filters.objectType, filters.region, filters.workType, filters.year, projects],
  )

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((current) => setParam(current, key, value))
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  return (
    <>
      <Seo
        title="Проекты"
        description="Реестр проектов СтройНефтеГаз с фильтрацией по типу объекта, работ, региону и году."
        canonicalPath="/projects"
      />

      <section className="relative overflow-hidden border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
        <img
          src="/images/object-grs.png"
          alt="Объекты дорожной инфраструктуры"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/92 via-graphite/85 to-graphite/78" />

        <Container className="relative z-10">
          <Reveal>
            <Breadcrumbs
              dark
              items={[{ label: 'Главная', to: '/' }, { label: 'Проекты' }]}
            />
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Проекты
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
              Подборка реализованных проектов по строительству, ПНР, автоматизации и
              ТСО/ИТСО.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-canvas py-10 text-ink sm:py-12 lg:py-16">
        <Container>
          {projectsError ? (
            <p className="caption mb-4 text-muted">
              Отображаются локальные данные. API: {projectsError}
            </p>
          ) : null}

          <Reveal>
            <FiltersBar onReset={resetFilters}>
              <label className={labelClassName}>
                <span className="caption text-muted">Тип объекта</span>
                <select
                  value={filters.objectType}
                  onChange={(event) =>
                    handleFilterChange('objectType', event.currentTarget.value)
                  }
                  className={selectClassName}
                  aria-label="Фильтр по типу объекта"
                >
                  <option value="">Все</option>
                  {options.objectTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Тип работ</span>
                <select
                  value={filters.workType}
                  onChange={(event) =>
                    handleFilterChange('workType', event.currentTarget.value)
                  }
                  className={selectClassName}
                  aria-label="Фильтр по типу работ"
                >
                  <option value="">Все</option>
                  {options.workTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Регион</span>
                <select
                  value={filters.region}
                  onChange={(event) => handleFilterChange('region', event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по региону"
                >
                  <option value="">Все</option>
                  {options.regions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Год</span>
                <select
                  value={filters.year}
                  onChange={(event) => handleFilterChange('year', event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по году"
                >
                  <option value="">Все</option>
                  {options.years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </FiltersBar>
          </Reveal>

          <Reveal>
            <div className="mt-7 border-y border-ink/15 py-3 sm:mt-8">
              <p className="caption text-muted">Найдено: {filteredProjects.length}</p>
            </div>
          </Reveal>

          <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <Reveal key={project.id} delay={index * 0.05}>
                <Card className="h-full p-0">
                  <Link to={`/projects/${project.slug}`} className="flex h-full flex-col">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="caption text-muted">{project.year}</p>
                        <span className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                          {project.objectType}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold leading-tight text-ink">
                        {project.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{project.excerpt}</p>
                      <div className="mt-auto pt-5 text-[0.62rem] uppercase tracking-[0.2em] text-accent">
                        Открыть карточку →
                      </div>
                    </div>
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 sm:mt-14">
            <div className="border border-ink/15 bg-white p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="caption text-muted">Реестр опыта</p>
                  <h2 className="mt-3 text-xl font-semibold text-ink sm:text-2xl">
                    Данные из формы «Опыт работ»
                  </h2>
                </div>
                <a
                  href="/documents/experience-2025.xlsx"
                  download
                  className="inline-flex h-11 items-center justify-center border border-ink/20 px-5 text-[0.62rem] uppercase tracking-[0.2em] text-ink transition hover:border-accent hover:text-accent"
                >
                  Скачать XLSX
                </a>
              </div>

              <div className="mt-5 overflow-x-auto border border-ink/10">
                <table className="min-w-[980px] w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f2f4f7]">
                      <th className="border-b border-r border-ink/10 px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                        Год
                      </th>
                      <th className="border-b border-r border-ink/10 px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                        Заказчик
                      </th>
                      <th className="border-b border-r border-ink/10 px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                        Предмет договора / объект
                      </th>
                      <th className="border-b border-ink/10 px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                        Виды работ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {experienceRows.map((row) => (
                      <tr key={row.id} className="align-top even:bg-[#fafbfc]">
                        <td className="border-b border-r border-ink/10 px-4 py-3 text-sm font-medium text-ink">
                          {row.year}
                        </td>
                        <td className="border-b border-r border-ink/10 px-4 py-3 text-sm leading-relaxed text-muted">
                          {row.customer}
                        </td>
                        <td className="border-b border-r border-ink/10 px-4 py-3 text-sm leading-relaxed text-ink">
                          {row.subject}
                        </td>
                        <td className="border-b border-ink/10 px-4 py-3 text-sm leading-relaxed text-muted">
                          {row.work || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
