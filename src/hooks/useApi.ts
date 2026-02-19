import { useState, useEffect } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Custom hook for fetching data from API with loading and error states
 */
export function useApi<T>(apiFunction: () => Promise<T>, dependencies: any[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()

      setData(result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 */
export function useApiMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = async (apiFunction: (params: P) => Promise<T>, params: P) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(params)

      setData(result)
      
return result
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred'

      setError(errorMessage)
      console.error('Mutation Error:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setData(null)
  }

  return { mutate, loading, error, data, reset }
}
