import { Container } from '../components/layout/Container'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Reveal } from '../components/motion/Reveal'

export const PolicyPage = () => (
  <>
    <Seo
      title="Политика конфиденциальности"
      description="Политика конфиденциальности сайта ООО СтройНефтеГаз."
      canonicalPath="/policy"
    />

    <section className="bg-canvas py-12 text-ink lg:py-16">
      <Container>
        <Reveal>
          <Breadcrumbs
            items={[
              { label: 'Главная', to: '/' },
              { label: 'Политика конфиденциальности' },
            ]}
          />
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            Политика конфиденциальности
          </h1>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
            <p>
              Настоящая политика определяет порядок обработки и защиты персональных
              данных, получаемых через сайт ООО «СтройНефтеГаз».
            </p>
            <p>
              Персональные данные обрабатываются в целях обратной связи, рассмотрения
              откликов и исполнения обязательств в рамках договорных отношений.
            </p>
            <p>
              Оператор обеспечивает конфиденциальность и безопасность персональных
              данных в соответствии с требованиями законодательства Российской
              Федерации.
            </p>
            <p>
              По вопросам обработки данных можно обратиться по адресу
              info@sng16.ru.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  </>
)
