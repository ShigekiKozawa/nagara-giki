export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9527' : 'https://gdrive-audio-playerapi-production.up.railway.app'),
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shigekikozawa.github.io/nagara-giki',
}

export const getApiUrl = (path: string = '') => {
  return `${env.apiBaseUrl}${path}`
}

export const getAuthUrl = (action: 'login' | 'callback') => {
  return `${env.apiBaseUrl}/auth/${action}`
} 