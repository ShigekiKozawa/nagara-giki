'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePlayerStore } from '@/stores/player-store'

function AuthSuccessContent() {
  const searchParams = useSearchParams()
  const { setAuthToken } = usePlayerStore()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      // トークンをストアとLocalStorageに保存
      setAuthToken(token)
      
      // URLからトークンを即座に削除
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.toString())
      
      // メインページにリダイレクト
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
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

export default function AuthSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">読み込み中...</h1>
          <p className="text-gray-600">しばらくお待ちください</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
} 