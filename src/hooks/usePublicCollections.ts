import { useEffect, useState } from 'react'
import { documents as fallbackDocuments, projects as fallbackProjects, vacancies as fallbackVacancies } from '../data'
import type { DocumentItem, Project, Vacancy } from '../types/models'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: string | null
}

const loadCollection = async <T,>(endpoint: string): Promise<T[]> => {
  const response = await fetch(endpoint, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = (await response.json()) as unknown

  if (!Array.isArray(payload)) {
    throw new Error('Payload должен быть массивом')
  }

  return payload as T[]
}

const usePublicCollection = <T,>(
  endpoint: string,
  fallbackData: T[],
): UseCollectionResult<T> => {
  const [data, setData] = useState<T[]>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        const remoteData = await loadCollection<T>(endpoint)

        if (!cancelled) {
          setData(remoteData)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Ошибка загрузки данных')
          setData(fallbackData)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [endpoint, fallbackData])

  return { data, loading, error }
}

export const usePublicProjects = () => {
  return usePublicCollection<Project>('/api/public/projects', fallbackProjects)
}

export const usePublicVacancies = () => {
  return usePublicCollection<Vacancy>('/api/public/vacancies', fallbackVacancies)
}

export const usePublicDocuments = () => {
  return usePublicCollection<DocumentItem>('/api/public/documents', fallbackDocuments)
}
