'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return '認証コードが取得できませんでした。'
      case 'no_token':
        return '認証トークンが取得できませんでした。'
      default:
        return error || '認証中に不明なエラーが発生しました。'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">認証エラー</h1>
        <p className="text-gray-600 mb-6">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>ホームに戻る</span>
          </Link>
          
          <p className="text-sm text-gray-500">
            問題が続く場合は、ブラウザのキャッシュをクリアして再試行してください。
          </p>
        </div>
      </div>
    </div>
  )
} 