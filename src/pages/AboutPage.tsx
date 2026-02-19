import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Accordion } from '../components/ui/Accordion'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'

const timelineItems = [
  {
    year: '2013',
    title: 'Основание компании',
    text: 'Старт деятельности ООО «СтройНефтеГаз» в сегменте строительства и инженерного сопровождения объектов нефтегазовой отрасли.',
  },
  {
    year: '2022',
    title: 'Стратегическое партнерство',
    text: 'С 2022 года ключевым партнером компании является ПАО «Газпром», расширен объем работ на объектах газотранспортной инфраструктуры.',
  },
  {
    year: '2023',
    title: 'Масштабирование работ на объектах ГРС',
    text: 'Реализованы шеф-монтаж, ПНР и автоматизация на объектах ООО «Газпром трансгаз Казань».',
  },
  {
    year: '2024',
    title: 'Расширение технического контура',
    text: 'Выполнены проекты по КИТСО/САЗ, электромонтажу, автоматизации и дооснащению инфраструктурных объектов.',
  },
]

const principles = [
  {
    id: 'principle-1',
    title: 'Документальная прозрачность',
    content:
      'Каждый этап работ сопровождается актами, протоколами и исполнительной документацией в согласованных форматах заказчика.',
  },
  {
    id: 'principle-2',
    title: 'Проектная дисциплина',
    content:
      'Управление сроками, рисками и ресурсами ведется через поэтапное планирование, регулярный контроль и отчетность.',
  },
  {
    id: 'principle-3',
    title: 'Инженерная преемственность',
    content:
      'Команда объединяет экспертизу строительно-монтажного блока, ПНР и автоматизации, что снижает потери на стыках процессов.',
  },
]

export const AboutPage = () => (
  <>
    <Seo
      title="О компании"
      description="Профиль, методология и производственный подход ООО СтройНефтеГаз."
      canonicalPath="/about"
    />

    <section className="border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
      <Container>
        <Reveal>
          <Breadcrumbs
            dark
            items={[{ label: 'Главная', to: '/' }, { label: 'О компании' }]}
          />
          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="caption text-white/55">Профиль организации</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Системная инженерная компания
                <span className="block text-white/75">для промышленной инфраструктуры</span>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/72 lg:col-span-5">
              ООО «СтройНефтеГаз» основано в 2013 году и выполняет полный цикл работ:
              строительство, пусконаладка, автоматизация АСУ ТП/КИПиА, КИТСО/САЗ,
              электромонтаж и ЭХЗ на объектах нефтегазовой отрасли.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>

    <section className="bg-canvas py-10 text-ink sm:py-12">
      <Container>
        <img
          src="/images/about.png"
          alt="Инженерный профиль компании"
          className="h-[32vh] min-h-[220px] w-full border border-ink/15 object-cover sm:h-[36vh] sm:min-h-[260px]"
          loading="lazy"
          decoding="async"
        />
      </Container>
    </section>

    <Section
      index="01"
      title="Краткий профиль"
      description="Ключевые показатели, применимые к отборочным и закупочным процедурам."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="caption text-muted">Юридический статус</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Российское юридическое лицо с регистрацией в 2013 году. Актуальные
            реквизиты, учредительные сведения и подтверждающие документы предоставляются
            в составе тендерной документации.
          </p>
        </Card>
        <Card>
          <p className="caption text-muted">Производственный контур</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Строительно-монтажные и электромонтажные работы, ПНР, АСУ ТП/КИПиА,
            КИТСО/САЗ, шеф-монтаж ГРС и электрохимическая защита трубопроводов.
          </p>
        </Card>
        <Card>
          <p className="caption text-muted">География</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Основная деятельность сосредоточена в регионах присутствия предприятий
            ПАО «Газпром» и смежной нефтегазовой инфраструктуры с возможностью
            оперативной мобилизации команд.
          </p>
        </Card>
        <Card>
          <p className="caption text-muted">Контроль качества</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Работы выполняются в строгом соответствии с нормативными требованиями,
            регламентами безопасности и обязательной исполнительной документацией на
            каждом этапе реализации.
          </p>
        </Card>
      </div>
    </Section>

    <Section
      index="02"
      title="Этапы развития"
      description="Референтные вехи формирования текущего производственного профиля."
      tone="dark"
    >
      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <Reveal key={item.year} delay={index * 0.06}>
            <Card dark>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="caption text-white/50">{item.year}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72">{item.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>

    <Section
      index="03"
      title="Принципы работы"
      description="Ключевые управленческие и технические принципы, применяемые на проектах."
    >
      <Accordion items={principles} />
    </Section>
  </>
)
