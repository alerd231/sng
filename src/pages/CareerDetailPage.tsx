import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { type FormEvent, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Reveal } from '../components/motion/Reveal'
import { Seo } from '../components/seo/Seo'
import { Accordion } from '../components/ui/Accordion'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { usePublicVacancies } from '../hooks/usePublicCollections'
import {
  formatDate,
  formatEmployment,
  formatExperience,
  formatSalary,
  formatVacancyFormat,
} from '../utils/format'
import { sendApplicationToTelegram } from '../utils/telegram'

const inputClassName =
  'h-11 border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-12'

const textareaClassName =
  'min-h-[120px] border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-[130px]'

interface ApplyFormState {
  fullName: string
  email: string
  phone: string
  message: string
  consent: boolean
}

const initialFormState: ApplyFormState = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
  consent: false,
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
}

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.99,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const workflowReveal: Variants = {
  hidden: {
    opacity: 0,
    x: -14,
    filter: 'blur(4px)',
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.54,
      delay: index * 0.07,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export const CareerDetailPage = () => {
  const { slug } = useParams()
  const { data: vacancies, loading: vacanciesLoading } = usePublicVacancies()
  const vacancy = vacancies.find((item) => item.slug === slug)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ApplyFormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const reducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 64])
  const heroOverlayOpacity = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const heroAccentY = useTransform(scrollYProgress, [0, 1], [0, -24])

  const heroImageStyle = reducedMotion ? undefined : { scale: heroImageScale, y: heroImageY }
  const heroOverlayStyle = reducedMotion ? undefined : { opacity: heroOverlayOpacity }
  const heroAccentStyle = reducedMotion ? undefined : { y: heroAccentY }

  const accordionItems = useMemo(() => {
    if (!vacancy) {
      return []
    }

    return [
      {
        id: 'resp',
        title: 'Функциональные обязанности',
        content: vacancy.responsibilities.join('; '),
      },
      {
        id: 'req',
        title: 'Требования',
        content: vacancy.requirements.join('; '),
      },
      {
        id: 'cond',
        title: 'Условия',
        content: vacancy.conditions.join('; '),
      },
    ]
  }, [vacancy])

  if (!vacancy && vacanciesLoading) {
    return (
      <section className="bg-canvas py-20 text-ink">
        <Container>
          <p className="caption text-muted">Загрузка вакансии...</p>
        </Container>
      </section>
    )
  }

  if (!vacancy) {
    return <Navigate to="/404" replace />
  }

  const roleDescription = [
    `Позиция «${vacancy.title}» входит в блок «${vacancy.dept}» и предполагает участие в работах на объектах промышленной инфраструктуры. Команда формируется под проектный график с обязательной фиксацией промежуточных результатов.`,
    `Фокус роли: техническая дисциплина, корректность исполнительной документации и соблюдение сроков ввода этапов. Работа ведется во взаимодействии с производственным контуром, ПТО и представителями заказчика.`,
    `Формат занятости: ${formatEmployment(vacancy.employment).toLowerCase()}, уровень опыта — ${formatExperience(vacancy.experience).toLowerCase()}, локация базирования — ${vacancy.city}.`,
  ]

  const workflow = [
    {
      stage: '01',
      title: 'Планирование и подготовка',
      text: 'Согласование задач этапа, проверка исходных данных, подготовка комплекта рабочей и отчетной документации.',
    },
    {
      stage: '02',
      title: 'Полевой / объектный контур',
      text: 'Выполнение инженерных задач на площадке, фиксация статусов, взаимодействие с техническим надзором и службой эксплуатации.',
    },
    {
      stage: '03',
      title: 'Сдача этапа',
      text: 'Подготовка закрывающих материалов, подтверждение качества работ и передача результатов ответственному куратору.',
    },
  ]

  const resetModalState = () => {
    setForm(initialFormState)
    setSubmitting(false)
    setSubmitState('idle')
    setSubmitMessage('')
  }

  const openApplyModal = () => {
    resetModalState()
    setModalOpen(true)
  }

  const closeApplyModal = () => {
    setModalOpen(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.consent) {
      setSubmitState('error')
      setSubmitMessage('Подтвердите согласие на обработку персональных данных.')
      return
    }

    setSubmitting(true)
    setSubmitState('idle')
    setSubmitMessage('')

    try {
      await sendApplicationToTelegram({
        vacancyTitle: vacancy.title,
        vacancySlug: vacancy.slug,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        city: vacancy.city,
        dept: vacancy.dept,
        employment: formatEmployment(vacancy.employment),
        format: formatVacancyFormat(vacancy.format),
      })

      setSubmitState('success')
      setSubmitMessage('Отклик отправлен в кадровый контур. Мы свяжемся с вами после проверки данных.')
      setForm(initialFormState)
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'TELEGRAM_ENV_MISSING'
          ? 'Не настроены параметры Telegram (VITE_TELEGRAM_BOT_TOKEN и VITE_TELEGRAM_CHAT_ID).'
          : error instanceof Error && error.message === 'TELEGRAM_ENV_INVALID'
            ? 'Проверьте формат VITE_TELEGRAM_BOT_TOKEN в .env и перезапустите dev-сервер.'
          : 'Не удалось отправить отклик. Проверьте подключение и повторите попытку.'

      setSubmitState('error')
      setSubmitMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo
        title={vacancy.title}
        description={vacancy.summary}
        canonicalPath={`/careers/${vacancy.slug}`}
      />

      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-white/15 bg-frame py-10 text-white sm:py-12 lg:py-16"
      >
        <motion.img
          src="/images/object-grs.png"
          alt={vacancy.title}
          className="absolute inset-0 h-full w-full object-cover opacity-28"
          style={heroImageStyle}
          loading="eager"
          fetchPriority="high"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-graphite/94 via-graphite/86 to-graphite/78"
          style={heroOverlayStyle}
        />
        <motion.div
          className="pointer-events-none absolute -left-[18%] top-0 h-full w-[60%] bg-[radial-gradient(circle_at_50%_40%,rgba(184,29,39,0.22),transparent_66%)]"
          style={heroAccentStyle}
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.28, 0.5, 0.28],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{ duration: 7.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-[45%] bg-gradient-to-r from-transparent via-white/8 to-transparent"
          animate={
            reducedMotion
              ? undefined
              : {
                  x: ['0%', '230%'],
                  opacity: [0, 0.55, 0],
                }
          }
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />

        <Container className="relative z-10">
          <Reveal duration={0.74} distance={24} amount={0.15}>
            <Breadcrumbs
              dark
              items={[
                { label: 'Главная', to: '/' },
                { label: 'Вакансии', to: '/careers' },
                { label: vacancy.title },
              ]}
            />
            <p className="caption mt-5 text-white/55 sm:mt-6">{formatDate(vacancy.postedAt)}</p>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {vacancy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72 sm:mt-5">
              {vacancy.summary}
            </p>
          </Reveal>
        </Container>
      </section>

      <Section
        index="01"
        title="Описание роли"
        description="Подробный профиль вакансии и формат проектной работы."
        desktopSplit={false}
      >
        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          variants={staggerContainer}
          initial={reducedMotion ? undefined : 'hidden'}
          whileInView={reducedMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.16 }}
        >
          <motion.div variants={cardReveal} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <Card>
              <div className="space-y-4 text-sm leading-relaxed text-muted">
                {roleDescription.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardReveal} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <Card>
              <p className="caption text-muted">Проектный контур</p>
              <div className="mt-4 grid gap-3">
                {workflow.map((item, index) => (
                  <motion.div
                    key={item.stage}
                    className="border border-ink/12 p-4"
                    custom={index}
                    variants={workflowReveal}
                    initial={reducedMotion ? false : 'hidden'}
                    whileInView={reducedMotion ? undefined : 'visible'}
                    viewport={{ once: true, amount: 0.45 }}
                    whileHover={
                      reducedMotion
                        ? undefined
                        : {
                            y: -4,
                            borderColor: 'rgba(184,29,39,0.35)',
                            boxShadow: '0 10px 24px rgba(18,19,22,0.1)',
                          }
                    }
                  >
                    <p className="caption text-accent">{item.stage}</p>
                    <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Section>

      <Section
        index="02"
        title="Параметры вакансии"
        description="Сводные условия и формат участия в проектной команде."
        desktopSplit={false}
      >
        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          variants={staggerContainer}
          initial={reducedMotion ? undefined : 'hidden'}
          whileInView={reducedMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.16 }}
        >
          <motion.div className="space-y-4" variants={cardReveal}>
            <Card>
              <div className="grid gap-3 border-b border-ink/10 pb-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="caption text-muted">Город</p>
                  <p className="mt-2 text-ink">{vacancy.city}</p>
                </div>
                <div>
                  <p className="caption text-muted">Отдел</p>
                  <p className="mt-2 text-ink">{vacancy.dept}</p>
                </div>
                <div>
                  <p className="caption text-muted">Формат</p>
                  <p className="mt-2 text-ink">{formatVacancyFormat(vacancy.format)}</p>
                </div>
                <div>
                  <p className="caption text-muted">Занятость</p>
                  <p className="mt-2 text-ink">{formatEmployment(vacancy.employment)}</p>
                </div>
                <div>
                  <p className="caption text-muted">Опыт</p>
                  <p className="mt-2 text-ink">{formatExperience(vacancy.experience)}</p>
                </div>
                <div>
                  <p className="caption text-muted">Вознаграждение</p>
                  <p className="mt-2 font-semibold text-ink">
                    {formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}
                  </p>
                </div>
              </div>

              <div className="pt-5">
                <p className="caption text-muted">Ключевые слова</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vacancy.keywords.map((keyword) => (
                    <motion.span
                      key={keyword}
                      whileHover={
                        reducedMotion
                          ? undefined
                          : {
                              y: -2,
                              borderColor: 'rgba(184,29,39,0.45)',
                              backgroundColor: 'rgba(184,29,39,0.06)',
                            }
                      }
                      className="border border-ink/20 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-ink sm:text-[0.62rem]"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Card>

            <motion.div variants={cardReveal} whileHover={reducedMotion ? undefined : { y: -4 }}>
              <Accordion items={accordionItems} />
            </motion.div>
          </motion.div>

          <motion.div variants={cardReveal} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <Card className="lg:sticky lg:top-24">
              <p className="caption text-muted">Отклик</p>
              <h2 className="mt-3 text-xl font-semibold leading-tight text-ink">
                Отправить резюме
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Для первичного рассмотрения вакансии направьте контактные данные,
                резюме и краткое сопроводительное сообщение.
              </p>
              <Button type="button" className="mt-6 w-full" onClick={openApplyModal}>
                Откликнуться
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={closeApplyModal}
        title="Отклик на вакансию"
        tone="dark"
        size="lg"
        contentClassName="border-white/25 bg-gradient-to-br from-[#1a1d22] via-[#14181d] to-[#0f1216]"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-sm border border-white/15 bg-black/30 p-3 text-[0.88rem] leading-relaxed text-white/78 sm:p-4 sm:text-sm">
            <p className="caption text-white/55">Вакансия</p>
            <p className="mt-2 text-base font-semibold text-white">{vacancy.title}</p>
            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.15em] text-white/65 sm:text-xs">
              {vacancy.city} · {formatVacancyFormat(vacancy.format)} · {formatEmployment(vacancy.employment)}
            </p>
          </div>

          <form className="grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <label className="flex flex-col gap-2">
                <span className="caption text-white/60">ФИО</span>
                <input
                  required
                  className={inputClassName}
                  name="fullName"
                  value={form.fullName}
                  onChange={(event) => {
                    const value = event.currentTarget.value
                    setForm((prev) => ({ ...prev, fullName: value }))
                  }}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="caption text-white/60">Телефон</span>
                <input
                  required
                  type="tel"
                  className={inputClassName}
                  name="phone"
                  value={form.phone}
                  onChange={(event) => {
                    const value = event.currentTarget.value
                    setForm((prev) => ({ ...prev, phone: value }))
                  }}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="caption text-white/60">Email</span>
                <input
                  required
                  type="email"
                  className={inputClassName}
                  name="email"
                  value={form.email}
                  onChange={(event) => {
                    const value = event.currentTarget.value
                    setForm((prev) => ({ ...prev, email: value }))
                  }}
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="caption text-white/60">Желаемая дата выхода</span>
                <input className={inputClassName} name="startDate" placeholder="Например: в течение 2 недель" />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="caption text-white/60">Комментарий</span>
              <textarea
                className={textareaClassName}
                name="message"
                placeholder="Кратко опишите релевантный опыт, объекты и доступность"
                value={form.message}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  setForm((prev) => ({ ...prev, message: value }))
                }}
              />
            </label>

            <label className="flex items-start gap-3 border border-white/15 bg-black/20 p-3 text-xs leading-relaxed text-white/78 sm:text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 border-white/30 bg-transparent accent-accent"
                checked={form.consent}
                onChange={(event) => {
                  const checked = event.currentTarget.checked
                  setForm((prev) => ({ ...prev, consent: checked }))
                }}
              />
              <span>
                Подтверждаю согласие на обработку персональных данных для рассмотрения
                отклика в рамках вакансии.
              </span>
            </label>

            {submitState !== 'idle' ? (
              <p
                className={`text-sm leading-relaxed ${
                  submitState === 'success' ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {submitMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3">
              <Button
                type="submit"
                className="w-full sm:min-w-[190px] sm:w-auto"
                disabled={submitting}
                dark
              >
                {submitting ? 'Отправка...' : 'Отправить отклик'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                dark
                onClick={closeApplyModal}
                className="w-full sm:min-w-[140px] sm:w-auto"
              >
                Закрыть
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}
