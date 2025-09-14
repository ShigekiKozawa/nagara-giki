'use client'

import { useState, useEffect } from 'react'
import { InitialSetup } from '@/components/initial-setup'
import { PlaylistList } from '@/components/playlist-list'
import { PlaylistDetail } from '@/components/playlist-detail'
import { AudioPlayer } from '@/components/audio-player'
import { usePlayerStore } from '@/stores/player-store'

export default function Home() {
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  
  const { 
    playlists, 
    createPlaylist, 
    setCurrentPlaylist,
    currentPlaylistId,
    loadPlaylistFiles
  } = usePlayerStore()

  useEffect(() => {
    if (isFirstLoad) {
      // LocalStorageから既存のトークンを確認
      const existingToken = localStorage.getItem('gdap-auth-token')
      
      if (existingToken) {
        const { setAuthToken } = usePlayerStore.getState()
        setAuthToken(existingToken)
      }

      const hasPlaylists = playlists.length > 0

      if (hasPlaylists) {
        setIsFirstLoad(false)
      }
    }
  }, [playlists.length, isFirstLoad])

  const handleSetupComplete = async (playlistName: string, folderId: string, authUrl?: string) => {
    try {
      
      // 認証URLが提供された場合の処理
      if (authUrl) {
        window.location.href = authUrl
        return
      } else {
        // URLからトークンを取得（認証後のリダイレクト）
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        if (token) {
          // 認証トークンをストアに保存
          const { setAuthToken } = usePlayerStore.getState()
          setAuthToken(token)
          
          // URLからトークンを削除
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          // LocalStorageから既存のトークンを確認
          const existingToken = localStorage.getItem('gdap-auth-token')
          
          if (existingToken) {
            const { setAuthToken } = usePlayerStore.getState()
            setAuthToken(existingToken)
          } else {
          }
        }
      }
      
      // 最初のプレイリストを作成
      createPlaylist(playlistName, folderId)
      
      // プレイリスト作成後、最新のプレイリストを取得して楽曲を自動読み込み
      const latestPlaylist = usePlayerStore.getState().playlists[0]
      if (latestPlaylist) {
        loadPlaylistFiles(latestPlaylist.id).catch(() => {})
      }
      
      setIsFirstLoad(false)
    } catch (error) {
      alert('プレイリストの作成に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId)
    setCurrentView('detail')
    setCurrentPlaylist(playlistId)
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPlaylistId(null)
  }

  if (isFirstLoad && playlists.length === 0) {
    return <InitialSetup onComplete={handleSetupComplete} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' ? (
        <PlaylistList onSelectPlaylist={handleSelectPlaylist} />
      ) : selectedPlaylistId ? (
        <PlaylistDetail 
          playlistId={selectedPlaylistId} 
          onBack={handleBackToList}
        />
      ) : (
        <PlaylistList onSelectPlaylist={handleSelectPlaylist} />
      )}
      
      {/* 固定プレイヤー */}
      <AudioPlayer />
    </div>
  )
} 