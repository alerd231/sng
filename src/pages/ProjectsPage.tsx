import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { FiltersBar } from '../components/ui/FiltersBar'
import { usePublicProjects } from '../hooks/usePublicCollections'
import { uniqueValues } from '../utils/collections'
import { setParam } from '../utils/searchParams'

const selectClassName =
  'h-12 w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap border border-ink/20 bg-white px-4 pr-10 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5'

const labelClassName = 'flex min-w-0 flex-col gap-3 px-1 sm:px-2'

export const ProjectsPage = () => {
  const { data: projects, error: projectsError } = usePublicProjects()
  const [searchParams, setSearchParams] = useSearchParams()

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
          src="/images/background-project.png"
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
        </Container>
      </section>
    </>
  )
}
