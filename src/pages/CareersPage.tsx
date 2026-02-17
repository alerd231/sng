import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { FiltersBar } from '../components/ui/FiltersBar'
import { usePublicVacancies } from '../hooks/usePublicCollections'
import type { Vacancy, VacancySort } from '../types/models'
import {
  formatDate,
  formatEmployment,
  formatExperience,
  formatSalary,
  formatVacancyFormat,
} from '../utils/format'
import { setParam } from '../utils/searchParams'

const inputClassName =
  'h-12 border border-ink/20 bg-white px-5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const selectClassName =
  'h-12 border border-ink/20 bg-white px-5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const labelClassName = 'flex flex-col gap-3 px-2'

const byDateDesc = (left: Vacancy, right: Vacancy) =>
  right.postedAt.localeCompare(left.postedAt)

const bySalaryDesc = (left: Vacancy, right: Vacancy) =>
  right.salaryTo - left.salaryTo || byDateDesc(left, right)

const withPinnedFirst = (
  list: Vacancy[],
  comparator: (left: Vacancy, right: Vacancy) => number,
) => {
  const pinned = list.filter((item) => item.priority).sort(comparator)
  const regular = list.filter((item) => !item.priority).sort(comparator)
  return [...pinned, ...regular]
}

export const CareersPage = () => {
  const { data: vacancies, error: vacanciesError } = usePublicVacancies()
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    query: searchParams.get('query') ?? '',
    city: searchParams.get('city') ?? '',
    format: searchParams.get('format') ?? '',
    dept: searchParams.get('dept') ?? '',
    employment: searchParams.get('employment') ?? '',
    experience: searchParams.get('experience') ?? '',
    sort: (searchParams.get('sort') as VacancySort | null) ?? 'date_desc',
  }

  const options = useMemo(
    () => ({
      cities: Array.from(new Set(vacancies.map((vacancy) => vacancy.city))).sort(),
      formats: Array.from(new Set(vacancies.map((vacancy) => vacancy.format))),
      depts: Array.from(new Set(vacancies.map((vacancy) => vacancy.dept))).sort(),
      employment: Array.from(new Set(vacancies.map((vacancy) => vacancy.employment))),
      experience: Array.from(new Set(vacancies.map((vacancy) => vacancy.experience))),
    }),
    [vacancies],
  )

  const filteredVacancies = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()

    const filtered = vacancies.filter((vacancy) => {
      const searchable = `${vacancy.title} ${vacancy.keywords.join(' ')}`.toLowerCase()
      const matchesQuery = normalizedQuery ? searchable.includes(normalizedQuery) : true
      const matchesCity = filters.city ? vacancy.city === filters.city : true
      const matchesFormat = filters.format ? vacancy.format === filters.format : true
      const matchesDept = filters.dept ? vacancy.dept === filters.dept : true
      const matchesEmployment = filters.employment
        ? vacancy.employment === filters.employment
        : true
      const matchesExperience = filters.experience
        ? vacancy.experience === filters.experience
        : true

      return (
        matchesQuery &&
        matchesCity &&
        matchesFormat &&
        matchesDept &&
        matchesEmployment &&
        matchesExperience
      )
    })

    if (filters.sort === 'salary_desc') {
      return withPinnedFirst(filtered, bySalaryDesc)
    }

    if (filters.sort === 'priority') {
      return [...filtered].sort(
        (left, right) =>
          Number(right.priority) - Number(left.priority) || byDateDesc(left, right),
      )
    }

    return withPinnedFirst(filtered, byDateDesc)
  }, [
    filters.city,
    filters.dept,
    filters.employment,
    filters.experience,
    filters.format,
    filters.query,
    filters.sort,
    vacancies,
  ])

  const handleChange = (key: string, value: string, defaultValue = '') => {
    setSearchParams((current) => setParam(current, key, value, defaultValue))
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  return (
    <>
      <Seo
        title="Вакансии"
        description="Актуальные вакансии СтройНефтеГаз с фильтрами по городу, формату работы и опыту."
        canonicalPath="/careers"
      />

      <section className="relative overflow-hidden border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
        <img
          src="/images/background-career.png"
          alt="Промышленный объект компании"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/92 via-graphite/84 to-graphite/78" />

        <Container className="relative z-10">
          <Reveal>
            <Breadcrumbs
              dark
              items={[{ label: 'Главная', to: '/' }, { label: 'Вакансии' }]}
            />
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Карьера в СтройНефтеГаз
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
              Подбор вакансий по производственным блокам компании. Закрепленные позиции
              всегда выводятся в верхней части списка.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-canvas py-10 text-ink sm:py-12 lg:py-16">
        <Container>
          {vacanciesError ? (
            <p className="caption mb-4 text-muted">
              Отображаются локальные данные. API: {vacanciesError}
            </p>
          ) : null}


          <Reveal>
            <FiltersBar onReset={resetFilters}>
              <label className={`${labelClassName} md:col-span-2 xl:col-span-2`}>
                <span className="caption text-muted">Поиск</span>
                <input
                  value={filters.query}
                  onChange={(event) =>
                    handleChange('query', event.currentTarget.value)
                  }
                  className={inputClassName}
                  placeholder="Должность или ключевое слово"
                  aria-label="Поиск по вакансиям"
                />
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Город</span>
                <select
                  value={filters.city}
                  onChange={(event) => handleChange('city', event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по городу"
                >
                  <option value="">Все</option>
                  {options.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Отдел</span>
                <select
                  value={filters.dept}
                  onChange={(event) => handleChange('dept', event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по отделу"
                >
                  <option value="">Все</option>
                  {options.depts.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Формат</span>
                <select
                  value={filters.format}
                  onChange={(event) => handleChange('format', event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по формату"
                >
                  <option value="">Все</option>
                  {options.formats.map((format) => (
                    <option key={format} value={format}>
                      {formatVacancyFormat(format)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Занятость</span>
                <select
                  value={filters.employment}
                  onChange={(event) =>
                    handleChange('employment', event.currentTarget.value)
                  }
                  className={selectClassName}
                  aria-label="Фильтр по типу занятости"
                >
                  <option value="">Все</option>
                  {options.employment.map((employment) => (
                    <option key={employment} value={employment}>
                      {formatEmployment(employment)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Опыт</span>
                <select
                  value={filters.experience}
                  onChange={(event) =>
                    handleChange('experience', event.currentTarget.value)
                  }
                  className={selectClassName}
                  aria-label="Фильтр по опыту"
                >
                  <option value="">Любой</option>
                  {options.experience.map((experience) => (
                    <option key={experience} value={experience}>
                      {formatExperience(experience)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                <span className="caption text-muted">Сортировка</span>
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    handleChange('sort', event.currentTarget.value, 'date_desc')
                  }
                  className={selectClassName}
                  aria-label="Сортировка вакансий"
                >
                  <option value="date_desc">Сначала новые</option>
                  <option value="salary_desc">По верхней границе зарплаты</option>
                  <option value="priority">По приоритету</option>
                </select>
              </label>
            </FiltersBar>
          </Reveal>

          <Reveal>
            <div className="mt-7 border-y border-ink/15 py-3 sm:mt-8">
              <p className="caption text-muted">Найдено: {filteredVacancies.length}</p>
            </div>
          </Reveal>

          <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-2">
            {filteredVacancies.map((vacancy, index) => (
              <Reveal key={vacancy.id} delay={index * 0.04}>
                <Link to={`/careers/${vacancy.slug}`} className="block h-full" aria-label={`Открыть вакансию ${vacancy.title}`}>
                  <Card className="h-full p-0">
                    <div className="flex h-full flex-col p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="caption text-muted">{formatDate(vacancy.postedAt)}</p>
                        {vacancy.priority ? (
                          <span className="border border-accent bg-accent px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-white">
                            Приоритет
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-4 text-lg font-semibold leading-tight text-ink sm:text-xl">
                        {vacancy.title}
                      </h2>

                      <p className="mt-3 text-sm leading-relaxed text-muted">{vacancy.summary}</p>

                      <div className="mt-5 grid grid-cols-2 gap-2 text-[0.58rem] uppercase tracking-[0.16em] text-muted sm:gap-3 sm:text-[0.62rem]">
                        <span>{vacancy.city}</span>
                        <span>{formatVacancyFormat(vacancy.format)}</span>
                        <span>{formatEmployment(vacancy.employment)}</span>
                        <span>{formatExperience(vacancy.experience)}</span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
                        <p className="text-sm font-semibold text-ink">
                          {formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}
                        </p>
                        <span className="text-[0.58rem] uppercase tracking-[0.2em] text-accent sm:text-[0.62rem]">
                          Открыть →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

