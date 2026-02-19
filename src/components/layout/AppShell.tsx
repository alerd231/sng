import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Container } from './Container'
import { ScrollToTop } from './ScrollToTop'

const mainNavigation = [
  { to: '/', label: 'Главная', end: true },
  { to: '/about', label: 'О компании' },
  { to: '/competencies', label: 'Компетенции' },
  { to: '/projects', label: 'Проекты' },
  { to: '/documents', label: 'Документы' },
  { to: '/careers', label: 'Вакансии' },
  { to: '/contacts', label: 'Контакты' },
]

const legalNavigation = [
  { to: '/policy', label: 'Политика конфиденциальности' },
  { to: '/consent', label: 'Согласие на обработку данных' },
]

const mobileContacts = {
  phoneLabel: '+7 (996) 908-77-30',
  phoneHref: 'tel:+79669087730',
  emailLabel: 'info@sng16.ru',
  emailHref: 'mailto:info@sng16.ru',
}

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
    isActive ? 'text-white' : 'text-white/65 hover:text-white'
  }`

export const AppShell = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    const { style: htmlStyle } = document.documentElement
    const { style: bodyStyle } = document.body
    const prevHtmlOverflow = htmlStyle.overflow
    const prevBodyOverflow = bodyStyle.overflow

    htmlStyle.overflow = 'hidden'
    bodyStyle.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      htmlStyle.overflow = prevHtmlOverflow
      bodyStyle.overflow = prevBodyOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen])

  return (
    <div className="app-frame min-h-screen bg-graphite text-white">
      <ScrollToTop />

      <header className="sticky top-0 z-50 border-b border-white/15 bg-graphite/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-20 sm:gap-6">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center"
            aria-label="СтройНефтеГаз"
          >
            <img
              src="/images/logo.svg"
              alt="СтройНефтеГаз"
              className="h-8 w-auto sm:h-10"
              loading="eager"
              decoding="async"
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Основная навигация">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClassName}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 items-center border border-white/25 px-4 text-[0.6rem] uppercase tracking-[0.2em] text-white lg:hidden"
          >
            Меню
          </button>
        </Container>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-graphite transition-opacity duration-300 ease-smooth lg:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <Container className="flex h-full flex-col py-5 sm:py-6">
          <div className="flex items-center justify-end border-b border-white/15 pb-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Закрыть меню"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/30 text-white/85 transition hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav
            className="flex flex-1 flex-col justify-center gap-3 py-8"
            aria-label="Основная навигация"
          >
            {mainNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-white/10 py-4 text-[0.72rem] uppercase tracking-[0.2em] text-white/78 transition-colors hover:text-white"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/15 pt-5">
            <p className="caption text-white/45">Контакты</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={mobileContacts.phoneHref}
                className="text-sm text-white/80 transition-colors hover:text-white"
              >
                {mobileContacts.phoneLabel}
              </a>
              <a
                href={mobileContacts.emailHref}
                className="text-sm text-white/80 transition-colors hover:text-white"
              >
                {mobileContacts.emailLabel}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-white/15 bg-frame py-10 sm:py-12">
        <Container>
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-5">
              <p className="caption text-white/55">Профиль</p>
              <p className="max-w-lg text-sm leading-relaxed text-white/70">
                Строительство, пусконаладка, автоматизация, КИТСО/САЗ, электромонтаж
                и ЭХЗ для объектов промышленной инфраструктуры.
              </p>
            </div>
            <div className="lg:col-span-4">
              <p className="caption text-white/55">Разделы</p>
              <div className="mt-4 grid gap-2">
                {mainNavigation.slice(1).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-[0.64rem] uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-2 lg:col-span-3">
              <p className="caption text-white/55">Юридическая информация</p>
              {legalNavigation.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-6 text-[0.58rem] uppercase tracking-[0.2em] text-white/50 sm:mt-12 sm:text-[0.62rem]">
            © {new Date().getFullYear()} ООО "СтройНефтеГаз"
          </div>
        </Container>
      </footer>
    </div>
  )
}
