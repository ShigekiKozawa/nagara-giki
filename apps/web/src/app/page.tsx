'use client'

import { useState, useEffect } from 'react'
import { PlaylistList } from '@/components/playlist-list'
import { PlaylistDetail } from '@/components/playlist-detail'
import { AudioPlayer } from '@/components/audio-player'
import { usePlayerStore } from '@/stores/player-store'

export default function Home() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  
  const { 
    setCurrentPlaylist,
    currentPlaylistId,
    loadPlaylistFiles
  } = usePlayerStore()

  useEffect(() => {
    // LocalStorageから既存のトークンを確認
    const existingToken = localStorage.getItem('gdap-auth-token')
    
    if (existingToken) {
      const { setAuthToken } = usePlayerStore.getState()
      setAuthToken(existingToken)
    }
  }, [])

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId)
    setCurrentView('detail')
    setCurrentPlaylist(playlistId)
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPlaylistId(null)
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