'use client'

import { useState, useEffect } from 'react'

import { usePlayerStore } from '@/stores/player-store'
import { getAuthUrl, getApiUrl } from '@/config/env'

interface InitialSetupProps {
  onComplete: (playlistName: string, folderId: string, authToken?: string) => void
}

export function InitialSetup({ onComplete }: InitialSetupProps) {
  const [step, setStep] = useState<'auth' | 'folder'>('auth')
  const [folderId, setFolderId] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [validationResult, setValidationResult] = useState<{ isValid?: boolean; is_valid?: boolean; message?: string } | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { setAuthToken } = usePlayerStore()

  useEffect(() => {
    const existingToken = localStorage.getItem('gdap-auth-token')
    if (existingToken) {
      setAuthToken(existingToken)
      setStep('folder')
    }
  }, [setAuthToken])

  const handleGoogleAuth = () => {
    window.location.href = getAuthUrl('login')
  }

  const extractFolderId = (input: string): string => {
    const trimmed = input.trim()
    
    // Google DriveのURL形式をチェック
    const urlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9-_]+)/)
    if (urlMatch) {
      return urlMatch[1]
    }
    
    // 直接IDが入力された場合
    return trimmed
  }

  const validateFolder = async () => {
    if (!folderId.trim()) return

    setIsValidating(true)
    setValidationResult(null)

    try {
      const { authToken } = usePlayerStore.getState()
      
      if (!authToken) {
        setValidationResult({ 
          isValid: false, 
          message: '認証トークンがありません。再度ログインしてください。' 
        })
        setStep('auth')
        return
      }

      const actualFolderId = extractFolderId(folderId)

      
      const response = await fetch(getApiUrl(`/api/validate-folder/${actualFolderId}?token=${authToken}`))
      const result = await response.json()
      
      setValidationResult(result)
      
      if (result.is_valid || result.isValid) {
        onComplete(playlistName, actualFolderId, authToken)
      }
    } catch (error) {
      setValidationResult({ 
        isValid: false, 
        message: 'フォルダの検証中にエラーが発生しました' 
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playlistName.trim() || !folderId.trim()) {
      return
    }

    if (!validationResult?.isValid && !validationResult?.is_valid) {
      return
    }

    
    const { authToken } = usePlayerStore.getState()
    onComplete(playlistName, folderId, authToken)
  }



  if (step === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Google Drive Audio Player
            </h1>
            <p className="text-gray-600">
              Google Driveの音楽ファイルを再生するために、まずGoogleアカウントでログインしてください。
            </p>
            <button 
              onClick={handleGoogleAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Googleでログイン
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">初期設定</h1>
            <p className="text-gray-600 mt-2">
              プレイリスト名とGoogle DriveフォルダIDを入力してください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレイリスト名
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: お気に入りの音楽"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Drive フォルダID または URL
            </label>
            <input
              type="text"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 1ABC123def456GHI789jkl または https://drive.google.com/drive/folders/1ABC123def456GHI789jkl"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              フォルダIDまたはGoogle DriveのフォルダURLを入力してください
            </p>
          </div>

          <button
            type="button"
            onClick={validateFolder}
            disabled={!folderId.trim() || isValidating}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isValidating ? 'フォルダを確認中...' : 'フォルダを確認'}
          </button>

          {validationResult && (
            <div className={`p-3 rounded-md ${
              (validationResult.isValid || validationResult.is_valid) 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {validationResult.message || 
                ((validationResult.isValid || validationResult.is_valid) 
                  ? 'フォルダが見つかりました！' 
                  : 'フォルダが見つかりませんでした')}
            </div>
          )}

          <button
            type="submit"
            disabled={!playlistName.trim() || !folderId.trim() || (!validationResult?.isValid && !validationResult?.is_valid)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            セットアップ完了
          </button>
        </form>
      </div>
    </div>
  )
} 