import type { ReactNode } from 'react'
import { Seo } from '../components/seo/Seo'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/motion/Reveal'

const requisites: Array<{ label: string; value: ReactNode }> = [
  {
    label: 'Полное наименование предприятия',
    value: 'Общество с ограниченной ответственностью «СтройНефтеГаз»',
  },
  {
    label: 'Сокращенное наименование предприятия',
    value: 'ООО «СНГ»',
  },
  {
    label: 'Юридический адрес',
    value: '420021, г. Казань, ул. Габдуллы Тукая, зд. 91',
  },
  {
    label: 'Фактический (почтовый) адрес',
    value: '420087, г. Казань, ул. Родины, 7/1, оф. 35',
  },
  {
    label: 'Адрес электронной почты',
    value: (
      <div className="space-y-1">
        <p>
          <a href="mailto:info@sng16.ru" className="transition-colors hover:text-accent">
            info@sng16.ru
          </a>{' '}
          - бухгалтерия и секретариат
        </p>
        <p>
          <a href="mailto:plotnikovaa@sng16.ru" className="transition-colors hover:text-accent">
            plotnikovaa@sng16.ru
          </a>{' '}
          - Плотников Андрей Александрович
        </p>
      </div>
    ),
  },
  {
    label: 'ОГРН',
    value: '1131690086868',
  },
  {
    label: 'ИНН/КПП',
    value: '1655282573 / 165501001',
  },
  {
    label: 'Директор',
    value: (
      <div className="space-y-1">
        <p>Плотников Сергей Александрович</p>
        <p>
          тел:{' '}
          <a href="tel:+79662508730" className="transition-colors hover:text-accent">
            +7 (966) 250-87-30
          </a>
        </p>
        <p>
          тел:{' '}
          <a href="tel:+78432508730" className="transition-colors hover:text-accent">
            +7 (843) 250-87-30
          </a>
        </p>
        <p>
          <a href="mailto:sst.psa@gmail.com" className="transition-colors hover:text-accent">
            sst.psa@gmail.com
          </a>
        </p>
      </div>
    ),
  },
  {
    label: 'Заместитель директора',
    value: (
      <div className="space-y-1">
        <p>Плотников Андрей Александрович</p>
        <p>
          тел:{' '}
          <a href="tel:+79662507730" className="transition-colors hover:text-accent">
            +7 (966) 250-77-30
          </a>
        </p>
        <p>
          тел:{' '}
          <a href="tel:+78432507730" className="transition-colors hover:text-accent">
            +7 (843) 250-77-30
          </a>
        </p>
      </div>
    ),
  },
  {
    label: 'Коды ОКВЭД',
    value: '45.21, 45.11, 45.11.2, 45.21.1, 45.21.4, 45.25.4',
  },
  {
    label: 'Банковские реквизиты',
    value: (
      <div className="space-y-1">
        <p>Р/с 40702810962000042747 в Отделении Банк Татарстан №8610 ПАО Сбербанк</p>
        <p>К/с 30101810600000000603, БИК 049205603</p>
      </div>
    ),
  },
  {
    label: 'ОКПО',
    value: '34730661',
  },
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
            420087, г. Казань, ул. Родины, 7/1, оф. 35.
          </p>
          <div className="mt-5 space-y-2 text-sm text-ink">
            <p>
              Телефон:{' '}
              <a href="tel:+79969087730" className="transition-colors hover:text-accent">
                +7 (996) 908-77-30
              </a>
            </p>
            <p>
              Email:{' '}
              <a href="mailto:info@sng16.ru" className="transition-colors hover:text-accent">
                info@sng16.ru
              </a>
            </p>
          </div>
          <Button href="mailto:info@sng16.ru" className="mt-6" variant="secondary">
            Написать письмо
          </Button>
        </Card>

        <Card className="overflow-hidden p-0">
          <iframe
            title="Карта офиса: г. Казань, ул. Родины, 7/1, оф. 35"
            src="https://yandex.ru/map-widget/v1/?z=16&text=%D0%B3.%20%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C%2C%20%D1%83%D0%BB.%20%D0%A0%D0%BE%D0%B4%D0%B8%D0%BD%D1%8B%2C%207%2F1%2C%20%D0%BE%D1%84.%2035"
            className="h-full min-h-[280px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Card>
      </div>
    </Section>

    <Section
      index="02"
      title="Карточка сведений о предприятии"
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
            <div className="text-sm leading-relaxed text-white/85">{item.value}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)
