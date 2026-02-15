import { type FormEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Seo } from '../../components/seo/Seo'
import { Button } from '../../components/ui/Button'
import { useAdminAuth } from '../../admin/AdminAuthProvider'

export const AdminLoginPage = () => {
  const { isAuthenticated, login, loading } = useAdminAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string } | null)?.from
  const redirectTo = from && from.startsWith('/admin') ? from : '/admin'

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(username.trim(), password)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ошибка входа')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo
        title="Вход в админ-панель"
        description="Защищенный вход в административный контур управления проектами, вакансиями и документами."
        canonicalPath="/admin/login"
      />

      <main className="min-h-screen bg-graphite px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-md border border-white/20 bg-black/30 p-6 sm:p-8">
          <p className="caption text-white/45">ADMIN ACCESS</p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight">Панель управления контентом</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Вход доступен только авторизованному администратору. Все операции CRUD логируются на сервере.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="caption text-white/55">Логин</span>
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                className="h-11 border border-white/25 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="caption text-white/55">Пароль</span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                className="h-11 border border-white/25 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <Button type="submit" dark disabled={submitting} className="mt-1 w-full">
              {submitting ? 'Проверка...' : 'Войти'}
            </Button>
          </form>
        </div>
      </main>
    </>
  )
}
