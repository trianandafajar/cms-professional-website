// src/lib/data/auth.ts
import { apiClient } from '@/lib/apiClient'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
}

export interface User {
  id: string
  email: string
  name?: string
  role?: any
  roleName?: string
}

export interface LoginResponse {
  user: User
  token?: string
  exp?: number
}

export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/users/login', credentials)
}

export async function register(data: RegisterPayload): Promise<{ user: User; token?: string }> {
  return apiClient.post('/api/users', data)
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/users/logout')
}

export async function getMe(): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>('/api/me')
}
