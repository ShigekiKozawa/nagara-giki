'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePlayerStore } from '@/stores/player-store'

export default function AuthSuccess() {
  const searchParams = useSearchParams()
  const { setAuthToken } = usePlayerStore()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      
      // トークンをストアとLocalStorageに保存
      setAuthToken(token)
      
      // メインページにリダイレクト
      window.location.href = '/'
    } else {
      // エラーの場合もメインページに戻る
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }, [searchParams, setAuthToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">認証処理中...</h1>
        <p className="text-gray-600">しばらくお待ちください</p>
      </div>
    </div>
  )
} 