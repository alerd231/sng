import { Seo } from '../components/seo/Seo'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/motion/Reveal'

const requisites = [
  { label: 'Наименование', value: 'ООО "СтройНефтеГаз"' },
  { label: 'ИНН/КПП', value: '1655000000 / 165501001' },
  { label: 'ОГРН', value: '1171690000000' },
  { label: 'Юридический адрес', value: '420000, Республика Татарстан, г. Казань' },
  { label: 'Расчетный счет', value: '40702810000000000000' },
  { label: 'Банк', value: 'АО "Банк развития" г. Казань' },
  { label: 'БИК', value: '049205000' },
  { label: 'Корр. счет', value: '30101810000000000000' },
  { label: 'Руководитель', value: 'Директор ООО "СтройНефтеГаз" — С. А. Плотников' },
]

export const ContactsPage = () => (
  <>
    <Seo
      title="Контакты"
      description="Контакты и реквизиты ООО СтройНефтеГаз для деловой коммуникации и тендерных процедур."
      canonicalPath="/contacts"
    />

    <section className="border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16">
      <Container>
        <Reveal>
          <Breadcrumbs
            dark
            items={[{ label: 'Главная', to: '/' }, { label: 'Контакты' }]}
          />
          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
            Контакты и реквизиты
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
            Каналы связи для закупочных и проектных запросов, а также основные
            юридические данные организации.
          </p>
        </Reveal>
      </Container>
    </section>

    <Section
      index="01"
      title="Оперативные контакты"
      description="Для первичной коммуникации по договорам, проектам и документам."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="caption text-muted">Центральный офис</p>
          <p className="mt-4 text-sm leading-relaxed text-ink">
            Республика Татарстан, г. Казань, инженерный деловой кластер.
          </p>
          <div className="mt-5 space-y-2 text-sm text-ink">
            <p>
              Телефон: <a href="tel:+78432000000">+7 (843) 200-00-00</a>
            </p>
            <p>
              Email: <a href="mailto:info@stroineftegaz.ru">info@stroineftegaz.ru</a>
            </p>
          </div>
          <Button href="mailto:info@stroineftegaz.ru" className="mt-6" variant="secondary">
            Написать письмо
          </Button>
        </Card>

        <Card className="p-0">
          <img
            src="/images/object-grs.png"
            alt="Локация офиса"
            className="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </Card>
      </div>
    </Section>

    <Section
      index="02"
      title="Реквизиты"
      description="Официальные сведения для договоров, счетов и тендерной документации."
      tone="dark"
    >
      <div className="border border-white/20 bg-white/5">
        {requisites.map((item) => (
          <div
            key={item.label}
            className="grid gap-2 border-b border-white/12 px-4 py-4 last:border-b-0 sm:grid-cols-[280px_1fr] sm:gap-6"
          >
            <p className="caption text-white/55">{item.label}</p>
            <p className="text-sm leading-relaxed text-white/85">{item.value}</p>
          </div>
        ))}
      </div>
    </Section>
  </>
)

