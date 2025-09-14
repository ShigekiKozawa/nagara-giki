// 環境変数の設定管理
export const config = {
  // API Server Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Frontend Configuration
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // Development/Production Mode
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      callback: '/auth/callback',
    },
    api: {
      validateFolder: '/api/validate-folder',
      audioFiles: '/api/audio-files',
      stream: '/api/stream',
    }
  }
}

// API URL生成ヘルパー関数
export const getApiUrl = (endpoint: string) => {
  return `${config.apiBaseUrl}${endpoint}`
}

// 認証URL生成
export const getAuthUrl = (type: 'login' | 'callback') => {
  return `${config.apiBaseUrl}${config.endpoints.auth[type]}`
} 