import { useMemo, useState } from 'react'
import { Container } from '../components/layout/Container'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FiltersBar } from '../components/ui/FiltersBar'
import { usePublicDocuments } from '../hooks/usePublicCollections'
import { formatDate } from '../utils/format'

const inputClassName =
  'h-12 border border-ink/20 bg-white px-5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const selectClassName =
  'h-12 border border-ink/20 bg-white px-5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const labelClassName = 'flex flex-col gap-3 px-2'

export const DocumentsPage = () => {
  const { data: documents, error: documentsError } = usePublicDocuments()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const categories = useMemo(
    () => Array.from(new Set(documents.map((document) => document.category))),
    [documents],
  )

  const filteredDocuments = useMemo(
    () =>
      [...documents]
        .filter((document) => {
          const matchesQuery = document.title
            .toLowerCase()
            .includes(query.trim().toLowerCase())
          const matchesCategory = category ? document.category === category : true
          return matchesQuery && matchesCategory
        })
        .sort((left, right) => right.date.localeCompare(left.date)),
    [category, documents, query],
  )

  return (
    <>
      <Seo
        title="Документы"
        description="Библиотека документов СтройНефтеГаз: учредительные, разрешительные и регламентные материалы."
        canonicalPath="/documents"
      />

      <section className="relative overflow-hidden border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
        <img
          src="/images/background-document.png"
          alt="Промышленный объект с инженерными системами"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/92 via-graphite/84 to-graphite/78" />

        <Container className="relative z-10">
          <Reveal>
            <Breadcrumbs
              dark
              items={[{ label: 'Главная', to: '/' }, { label: 'Документы' }]}
            />
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Библиотека документов
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
              Учредительные, разрешительные и регламентные документы компании в формате
              корпоративного архива.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-canvas py-10 text-ink sm:py-12 lg:py-16">
        <Container>
          {documentsError ? (
            <p className="caption mb-4 text-muted">
              Отображаются локальные данные. API: {documentsError}
            </p>
          ) : null}

          <Reveal>
            <FiltersBar onReset={() => {
              setQuery('')
              setCategory('')
            }}>
              <label className={`${labelClassName} md:col-span-2 xl:col-span-3`}>
                <span className="caption text-muted">Поиск</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Название документа"
                  className={inputClassName}
                  aria-label="Поиск документа"
                />
              </label>
              <label className={`${labelClassName} xl:col-span-1`}>
                <span className="caption text-muted">Категория</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.currentTarget.value)}
                  className={selectClassName}
                  aria-label="Фильтр по категории документов"
                >
                  <option value="">Все категории</option>
                  {categories.map((option) => (
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
              <p className="caption text-muted">Найдено: {filteredDocuments.length}</p>
            </div>
          </Reveal>

          <div className="mt-5 space-y-3 sm:mt-6">
            {filteredDocuments.map((document, index) => (
              <Reveal key={document.id} delay={index * 0.03}>
                <Card className="p-0">
                  <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="caption text-muted">{document.category}</p>
                      <h2 className="mt-3 text-base font-semibold leading-tight text-ink">
                        {document.title}
                      </h2>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">
                        {formatDate(document.date)} · {document.type} · {document.size}
                      </p>
                    </div>
                    <Button href={document.url} variant="secondary" target="_blank" rel="noreferrer">
                      Скачать
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
