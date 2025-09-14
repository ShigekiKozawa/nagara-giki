'use client'

import { useRef, useEffect, useState } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const preloadRef = useRef<HTMLAudioElement>(null) // プリロード用
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preloadedTrack, setPreloadedTrack] = useState<number | null>(null) // プリロード済みトラック

  const {
    audioFiles,
    currentTrack,
    currentTime,
    duration,
    volume,
    isPlaying,
    intendedPlaying,
    currentPlaylistId,
    playlists,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume
  } = usePlayerStore()

  const currentPlaylist = usePlayerStore(state => 
    state.playlists.find(p => p.id === currentPlaylistId)
  )

  const currentFile = audioFiles[currentTrack]
  const playlist = playlists.find(p => p.id === currentPlaylistId)

  // プリロード機能
  const preloadNextTrack = () => {
    if (!preloadRef.current || !currentPlaylistId) return

    const playableTracks = usePlayerStore.getState().getPlayableTracks(currentPlaylistId)
    if (playableTracks.length === 0) return

    let nextTrackIndex: number
    if (currentPlaylist?.isShuffleMode) {
      // シャッフルモードの場合はランダム
      nextTrackIndex = Math.floor(Math.random() * playableTracks.length)
    } else {
      // 通常モードの場合は次のトラック
      const currentPlayableIndex = playableTracks.findIndex(track => 
        audioFiles.indexOf(track) === currentTrack
      )
      nextTrackIndex = (currentPlayableIndex + 1) % playableTracks.length
    }

    const nextTrackFile = playableTracks[nextTrackIndex]
    const nextGlobalIndex = audioFiles.indexOf(nextTrackFile)

    // 既にプリロード済みの場合はスキップ
    if (preloadedTrack === nextGlobalIndex) return

    
    preloadRef.current.src = nextTrackFile.downloadUrl
    preloadRef.current.preload = 'auto'
    preloadRef.current.load()
    setPreloadedTrack(nextGlobalIndex)
  }

  // 現在の曲が50%再生されたらプリロード開始
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio && audio.duration && audio.currentTime) {
        const progress = audio.currentTime / audio.duration
        if (progress >= 0.5 && preloadedTrack !== currentTrack + 1) {
          preloadNextTrack()
        }
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate)
  }, [currentTrack, currentPlaylistId, preloadedTrack])

  // 次の曲に移動する際にプリロード済みの音源を使用
  const handleNextTrack = () => {
    const playableTracks = usePlayerStore.getState().getPlayableTracks(currentPlaylistId || '')
    if (playableTracks.length === 0) return

    let nextTrackIndex: number
    if (currentPlaylist?.isShuffleMode) {
      nextTrackIndex = Math.floor(Math.random() * playableTracks.length)
    } else {
      const currentPlayableIndex = playableTracks.findIndex(track => 
        audioFiles.indexOf(track) === currentTrack
      )
      nextTrackIndex = (currentPlayableIndex + 1) % playableTracks.length
    }

    const nextTrackFile = playableTracks[nextTrackIndex]
    const nextGlobalIndex = audioFiles.indexOf(nextTrackFile)

    // プリロード済みの場合は即座に切り替え
    if (preloadedTrack === nextGlobalIndex && preloadRef.current) {
      
      
      // メインのaudio要素にプリロード済みの状態をコピー
      const audio = audioRef.current
      if (audio && preloadRef.current.readyState >= 2) {
        audio.src = preloadRef.current.src
        audio.currentTime = 0
        
        // プリロード済みなので即座に再生可能
        usePlayerStore.setState({
          currentTrack: nextGlobalIndex,
          intendedPlaying: true,
          isPlaying: false,
          currentTime: 0
        })
        
        // 次の曲をプリロード
        setTimeout(() => preloadNextTrack(), 1000)
        return
      }
    }

    // 通常の次の曲処理
    nextTrack()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => {
  
      setIsLoading(true)
      setError(null)
    }

    const handleCanPlay = () => {
      
      setIsLoading(false)
      
      // intendedPlayingがtrueなのに再生されていない場合、手動で再生を試行
      const currentState = usePlayerStore.getState()
      if (currentState.intendedPlaying && audio.paused) {
        audio.play().catch((error) => {
        })
      }
    }

    const handleCanPlayThrough = () => {
      setIsLoading(false)
      const currentState = usePlayerStore.getState()
      if (currentState.intendedPlaying && audio.paused) {
        setTimeout(() => {
          audio.play().then(() => {
          }).catch((error) => {
          })
        }, 100)
      }
    }

    const handleWaiting = () => {
    }

    const handleStalled = () => {
    }

    const handleError = (e: Event) => {
      setError('音声ファイルの読み込みに失敗しました')
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      if (audio && !isNaN(audio.currentTime)) {
        usePlayerStore.setState({ currentTime: audio.currentTime })
      }
    }

    const handleDurationChange = () => {
      if (audio && !isNaN(audio.duration)) {
        usePlayerStore.setState({ duration: audio.duration })
      }
    }

    const handleEnded = () => {
      if (currentPlaylist?.isRepeatMode) {
        audio.currentTime = 0
        audio.play()
      } else {
        handleNextTrack()
      }
    }

    const handlePlay = () => {
    }

    const handlePause = () => {
      usePlayerStore.setState({ isPlaying: false })
    }

    const handlePlaying = () => {
      usePlayerStore.setState({ isPlaying: true })
    }

    const handleSeeking = () => {
      // シーク中はisPlayingをfalseにしてローディング表示
      const currentState = usePlayerStore.getState()
      if (currentState.intendedPlaying) {
        usePlayerStore.setState({ isPlaying: false })
      }
    }

    const handleSeeked = () => {
      // シーク完了後、intendedPlayingがtrueなら再生を再開
      const currentState = usePlayerStore.getState()
      if (currentState.intendedPlaying && audio.paused) {
        audio.play().catch((error) => {
        })
      }
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('canplaythrough', handleCanPlayThrough)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('stalled', handleStalled)
    audio.addEventListener('seeking', handleSeeking)
    audio.addEventListener('seeked', handleSeeked)
    audio.addEventListener('error', handleError)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('stalled', handleStalled)
      audio.removeEventListener('seeking', handleSeeking)
      audio.removeEventListener('seeked', handleSeeked)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentPlaylist?.isRepeatMode, handleNextTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (intendedPlaying) {
      // 既に再生中の場合は何もしない
      if (!audio.paused) {
        return
      }
      
      audio.play().then(() => {
      }).catch((error) => {
        // AbortErrorは無視（ユーザーが素早く操作した場合の正常な動作）
        if (error.name === 'AbortError') {
          return
        }

        setError('音声の再生に失敗しました')
        usePlayerStore.setState({ intendedPlaying: false, isPlaying: false })
      })
    } else {
      // 既に一時停止中の場合は何もしない
      if (audio.paused) {
        return
      }
      audio.pause()
    }
  }, [intendedPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current && currentFile) {
      const audio = audioRef.current
      
      // MediaSession APIでメディア情報を設定
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentFile.name.replace(/\.[^/.]+$/, ''), // 拡張子を除去
          artist: 'ながら聞き',
          album: playlist?.name || 'プレイリスト',
          artwork: [
            { src: '/icon.svg', sizes: '96x96', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '128x128', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '256x256', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '384x384', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
          ]
        })

        // メディアセッションのアクションハンドラーを設定
        navigator.mediaSession.setActionHandler('play', () => {
          if (audio.paused) {
            togglePlay()
          }
        })

        navigator.mediaSession.setActionHandler('pause', () => {
          if (!audio.paused) {
            togglePlay()
          }
        })

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          previousTrack()
        })

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextTrack()
        })

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime && audio.duration) {
            seekTo(details.seekTime)
          }
        })

        // 再生位置の更新
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0
        })
      }
    }
  }, [currentFile, playlist, togglePlay, previousTrack, nextTrack, seekTo])

  // 再生位置の定期更新
  useEffect(() => {
    if (audioRef.current && 'mediaSession' in navigator) {
      const audio = audioRef.current
      
      const updatePositionState = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime || 0
          })
        }
      }

      audio.addEventListener('timeupdate', updatePositionState)
      audio.addEventListener('durationchange', updatePositionState)
      
      return () => {
        audio.removeEventListener('timeupdate', updatePositionState)
        audio.removeEventListener('durationchange', updatePositionState)
      }
    }
  }, [])

  useEffect(() => {
    if (currentFile) {
      setError(null)
      const audio = audioRef.current
      if (audio) {
        
        // 現在の再生を停止
        audio.pause()
        audio.currentTime = 0
        
        // 新しいソースを設定
        audio.src = currentFile.downloadUrl
        
        // 明示的にリセット
        usePlayerStore.setState({ 
          currentTime: 0, 
          duration: 0 
        })
        
        audio.load()
        
        // プリロードをリセット
        setPreloadedTrack(null)
      }
    } else {
    }
  }, [currentFile])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time
      seekTo(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!currentFile) {
    return (
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="text-center text-gray-500">
          楽曲を選択してください
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4 z-50">
      {/* メインのaudio要素 */}
      <audio 
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          if (audioRef.current?.duration) {
            usePlayerStore.setState({ duration: audioRef.current.duration })
          }
        }}
        onLoadedData={() => {
        }}
        onProgress={() => {
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const currentState = usePlayerStore.getState()
            if (!currentState.isPlaying && !audioRef.current.paused) {
              usePlayerStore.setState({
                currentTime: audioRef.current.currentTime,
                isPlaying: true
              })
            } else {
              usePlayerStore.setState({ currentTime: audioRef.current.currentTime })
            }
          }
        }}
      />
      
      {/* プリロード用の隠れたaudio要素 */}
      <audio 
        ref={preloadRef}
        preload="none"
        style={{ display: 'none' }}
      />

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* シークバー */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime || 0}
          onChange={handleSeek}
          className="w-full h-1 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* メインコントロール */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* 楽曲情報 */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-xs sm:max-w-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-gray-500 text-xs sm:text-sm">♪</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{currentFile.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              プレイリスト
            </p>
          </div>
        </div>

        {/* 再生コントロール */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={previousTrack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 flex items-center justify-center transition-colors shadow-lg"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
            ) : intendedPlaying && !isPlaying ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            ) : (
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNextTrack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>

        {/* 音量コントロール（デスクトップのみ） */}
        <div className="hidden sm:flex items-center space-x-2 w-20">
          <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* モバイル用音量コントロール */}
      <div className="sm:hidden px-3 pb-2">
        <div className="flex items-center space-x-3">
          <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* プリロード状態表示（デバッグ用） */}
      {preloadedTrack !== null && (
        <div className="text-xs text-gray-400 text-center">
          🔄 次の曲をプリロード中: {audioFiles[preloadedTrack]?.name}
        </div>
      )}
    </div>
  )
} 