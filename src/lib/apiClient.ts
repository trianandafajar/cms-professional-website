// src/lib/apiClient.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, method: HttpMethod, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const res = await fetch(url, options)
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
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET')
  }
  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, 'POST', data)
  }
  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data)
  }
  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', data)
  }
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE')
  }
}

export const apiClient = new ApiClient()
