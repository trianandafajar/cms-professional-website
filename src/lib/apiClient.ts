// src/lib/apiClient.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '', timeout: number = 30000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    data?: any,
    requestOptions?: { timeout?: number },
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestOptions?.timeout ?? this.timeout)

    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: controller.signal,
    }
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    try {
      const res = await fetch(url, options)
      clearTimeout(timeoutId)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as any)
        // Payload v3 error shape: { errors: [{ message }] }
        const payloadErr = Array.isArray(body?.errors) && body.errors[0]?.message
        const message =
          payloadErr || body?.message || body?.error || `Request failed with status ${res.status}`
        throw new Error(message)
      }
      if (res.status === 204) return {} as T
      return res.json()
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw err
    }
  }

  get<T>(endpoint: string, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, options)
  }
  post<T>(endpoint: string, data?: any, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, options)
  }
  put<T>(endpoint: string, data?: any, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, options)
  }
  patch<T>(endpoint: string, data?: any, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', data, options)
  }
  delete<T>(endpoint: string, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, options)
  }
}

export const apiClient = new ApiClient()
