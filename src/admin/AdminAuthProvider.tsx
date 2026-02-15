import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface AdminUser {
  username: string
  role: 'admin'
}

interface SessionPayload {
  accessToken: string
  expiresIn: number
  user: AdminUser
}

interface AdminAuthContextValue {
  user: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

const parseResponseMessage = async (response: Response) => {
  try {
    const payload = await response.json()
    return typeof payload?.message === 'string'
      ? payload.message
      : `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

const withAuthHeader = (init: RequestInit | undefined, accessToken: string) => {
  const nextHeaders = new Headers(init?.headers)
  nextHeaders.set('Authorization', `Bearer ${accessToken}`)

  return {
    ...init,
    headers: nextHeaders,
    credentials: 'include' as const,
  }
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const tokenRef = useRef<string | null>(null)
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null)

  const setSession = useCallback((payload: SessionPayload | null) => {
    const token = payload?.accessToken ?? null
    setAccessToken(token)
    tokenRef.current = token
    setUser(payload?.user ?? null)
  }, [])

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    const request = (async () => {
      try {
        const response = await fetch('/api/admin/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          setSession(null)
          return false
        }

        const payload = (await response.json()) as SessionPayload
        setSession(payload)
        return true
      } catch {
        setSession(null)
        return false
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = request
    return request
  }, [setSession])

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      await refreshSession()
      if (mounted) {
        setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [refreshSession])

  const login = useCallback(async (username: string, password: string) => {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error(await parseResponseMessage(response))
    }

    const payload = (await response.json()) as SessionPayload
    setSession(payload)
  }, [setSession])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setSession(null)
    }
  }, [setSession])

  const authFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    let currentToken = tokenRef.current

    if (!currentToken) {
      const refreshed = await refreshSession()
      if (!refreshed || !tokenRef.current) {
        throw new Error('AUTH_REQUIRED')
      }

      currentToken = tokenRef.current
    }

    let response = await fetch(input, withAuthHeader(init, currentToken))

    if (response.status !== 401) {
      return response
    }

    const refreshed = await refreshSession()

    if (!refreshed || !tokenRef.current) {
      return response
    }

    response = await fetch(input, withAuthHeader(init, tokenRef.current))
    return response
  }, [refreshSession])

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user && accessToken),
    loading,
    login,
    logout,
    authFetch,
  }), [accessToken, authFetch, loading, login, logout, user])

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth должен использоваться внутри AdminAuthProvider')
  }

  return context
}
