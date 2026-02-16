import { Container } from '../components/layout/Container'
import { Seo } from '../components/seo/Seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Reveal } from '../components/motion/Reveal'

export const ConsentPage = () => (
  <>
    <Seo
      title="Согласие на обработку персональных данных"
      description="Форма согласия на обработку персональных данных ООО СтройНефтеГаз."
      canonicalPath="/consent"
    />

    <section className="bg-canvas py-12 text-ink lg:py-16">
      <Container>
        <Reveal>
          <Breadcrumbs
            items={[
              { label: 'Главная', to: '/' },
              { label: 'Согласие на обработку данных' },
            ]}
          />
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            Согласие на обработку персональных данных
          </h1>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
            <p>
              Пользователь, отправляя данные через формы сайта, подтверждает согласие
              на их обработку ООО «СтройНефтеГаз» в объеме, необходимом для обработки
              запроса.
            </p>
            <p>
              Обработка включает сбор, систематизацию, хранение, уточнение и удаление
              данных по достижении целей обработки либо по запросу субъекта данных.
            </p>
            <p>
              Согласие действует до момента его отзыва путем направления уведомления на
              адрес info@sng16.ru.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  </>
)
