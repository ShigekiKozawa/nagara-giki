'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Shuffle, Repeat, MoreHorizontal, Heart, SkipForward, Square, Loader2, RotateCcw } from 'lucide-react'
import { usePlayerStore } from '@/stores/player-store'

interface PlaylistDetailProps {
  playlistId: string
  onBack: () => void
}

export function PlaylistDetail({ playlistId, onBack }: PlaylistDetailProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const {
    playlists,
    audioFiles,
    currentTrack,
    isPlaying,
    intendedPlaying,
    favorites,
    skippedTracks,
    playTrack,
    togglePlay,
    stopPlayback,
    toggleFavorite,
    toggleSkipped,
    isFavorite,
    isSkipped,
    loadPlaylistFiles,
    isSyncing,
    syncingPlaylistId,
    togglePlaylistShuffle,
    togglePlaylistRepeat
  } = usePlayerStore()

  const playlist = playlists.find(p => p.id === playlistId)
  const playlistFiles = audioFiles.filter(file => file.playlistId === playlistId)
  const playableTracks = playlistFiles.filter(file => !isSkipped(file.id))

  useEffect(() => {
    if (playlistFiles.length === 0) {
      loadPlaylistFiles(playlistId)
    }
  }, [playlistId, playlistFiles.length, loadPlaylistFiles])

  const handleTrackPlay = (index: number) => {
    const globalIndex = audioFiles.findIndex(file => file.id === playlistFiles[index].id)
    if (globalIndex !== -1) {
      if (globalIndex === currentTrack && isPlaying) {
        togglePlay()
      } else {
        playTrack(globalIndex)
      }
    }
  }

  const formatFileSize = (size: string) => {
    const bytes = parseInt(size)
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const handlePlayAll = () => {
    if (playableTracks.length > 0) {
      const firstTrackIndex = audioFiles.findIndex(file => file.id === playableTracks[0].id)
      if (firstTrackIndex !== -1) {
        playTrack(firstTrackIndex)
      }
    }
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">プレイリストが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1 truncate">
            {playlist.name}
          </h1>
        </div>
      </div>

      {/* プレイリスト情報 */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm"
              style={{ backgroundColor: playlist.color }}
            >
              {playlist.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{playlist.name}</h2>
              <p className="text-gray-600 mb-2">
                {playlistFiles.length}曲
              </p>
              <div className="flex items-center space-x-2">
                {playlist.isShuffleMode && (
                  <span className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <Shuffle className="w-3 h-3" />
                    <span>シャッフル</span>
                  </span>
                )}
                {playlist.isRepeatMode && (
                  <span className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <Repeat className="w-3 h-3" />
                    <span>リピート</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="flex items-center space-x-3">
            {isSyncing && syncingPlaylistId === playlistId ? (
              <div className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 text-blue-600 py-3 rounded-xl font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>楽曲を同期中...</span>
              </div>
            ) : (
              <button
                onClick={handlePlayAll}
                disabled={playableTracks.length === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>すべて再生</span>
              </button>
            )}
            
            <button
              onClick={() => togglePlaylistShuffle(playlistId)}
              className={`p-3 rounded-xl transition-colors ${
                playlist.isShuffleMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => togglePlaylistRepeat(playlistId)}
              className={`p-3 rounded-xl transition-colors ${
                playlist.isRepeatMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => loadPlaylistFiles(playlistId)}
              disabled={isSyncing && syncingPlaylistId === playlistId}
              className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
              title="楽曲を再同期"
            >
              {isSyncing && syncingPlaylistId === playlistId ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* トラック一覧 */}
      <div className="mx-4 mt-4 mb-48 sm:mb-24">
        <div className="bg-white rounded-xl shadow-sm">
          {playlistFiles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">楽曲を読み込み中...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {playlistFiles.map((file, index) => {
                const globalIndex = audioFiles.findIndex(f => f.id === file.id)
                const isCurrentTrack = globalIndex === currentTrack
                const isTrackSkipped = isSkipped(file.id)
                const isTrackFavorite = isFavorite(file.id)

                return (
                  <div
                    key={file.id}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                      isCurrentTrack ? 'bg-blue-50' : ''
                    } ${isTrackSkipped ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => handleTrackPlay(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        isCurrentTrack && (intendedPlaying || isPlaying)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      disabled={isTrackSkipped}
                    >
                      {isCurrentTrack && intendedPlaying && !isPlaying ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                      ) : isCurrentTrack && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${
                        isCurrentTrack ? 'text-blue-600' : 'text-gray-900'
                      }`} title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {file.mimeType}
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-1 ml-auto flex-shrink-0">
                      {isCurrentTrack && (intendedPlaying || isPlaying) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            stopPlayback()
                          }}
                          className="p-2 rounded-full transition-colors text-red-500 hover:text-red-600"
                          title="停止"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(file.id)
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isTrackFavorite
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isTrackFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSkipped(file.id)
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isTrackSkipped
                            ? 'text-orange-500 hover:text-orange-600'
                            : 'text-gray-400 hover:text-orange-500'
                        }`}
                        title={isTrackSkipped ? 'スキップ解除' : 'スキップ'}
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 