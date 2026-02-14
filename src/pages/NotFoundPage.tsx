import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'

export const NotFoundPage = () => (
  <>
    <Seo
      title="Страница не найдена"
      description="Запрошенная страница не найдена на сайте СтройНефтеГаз."
      canonicalPath="/404"
    />

    <section className="flex min-h-[70vh] items-center bg-frame py-16 text-white">
      <Container>
        <p className="caption text-white/55">404</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          Страница не найдена
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/72">
          Проверьте адрес страницы или вернитесь в основной раздел сайта.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/" dark>
            На главную
          </Button>
          <Link
            to="/projects"
            className="inline-flex h-12 items-center border border-white/25 px-6 text-[0.68rem] uppercase tracking-[0.22em] text-white transition hover:border-accent"
          >
            Проекты
          </Link>
        </div>
      </Container>
    </section>
  </>
)
