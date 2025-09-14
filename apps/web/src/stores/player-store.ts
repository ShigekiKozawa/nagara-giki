import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AudioFile, Playlist, PlayerActions } from '@gdrive-audio-player/types'
import { PLAYLIST_COLORS } from '@gdrive-audio-player/types'

interface PlayerState {
  playlists: Playlist[]
  currentPlaylistId?: string
  audioFiles: AudioFile[]
  currentTrack: number
  isPlaying: boolean
  intendedPlaying: boolean // 意図された再生状態（ボタン表示用）
  currentTime: number
  duration: number
  volume: number
  favorites: string[]
  skippedTracks: string[]
  playHistory: string[]
  authToken?: string
  isSyncing: boolean // 楽曲同期中かどうか
  syncingPlaylistId?: string // 同期中のプレイリストID
}

// 認証関連のアクション
interface AuthActions {
  setAuthToken: (token: string) => void
  clearAuth: () => void
  validateFolder: (folderId: string) => Promise<{isValid: boolean, audioCount: number, folderName: string, error?: string}>
}

// 同期関連のアクション
interface SyncActions {
  setSyncing: (isSyncing: boolean, playlistId?: string) => void
}

interface PlayerStore extends PlayerState, PlayerActions, SyncActions {}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      playlists: [],
      currentPlaylistId: undefined,
      audioFiles: [],
      currentTrack: 0,
      isPlaying: false,
      intendedPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      favorites: [],
      skippedTracks: [],
      playHistory: [],
      authToken: undefined,
      isSyncing: false,
      syncingPlaylistId: undefined,

      // 認証関連
      setAuthToken: (token: string) => {
        localStorage.setItem('gdap-auth-token', token)
        set({ authToken: token })
      },
      
      clearAuth: () => set({ authToken: undefined }),

      validateFolder: async (folderId: string) => {
        const { authToken } = get()
        if (!authToken) {
          throw new Error('認証が必要です')
        }

        try {
          const { getApiUrl } = await import('@/config/env')
          const response = await fetch(getApiUrl(`/api/validate-folder/${folderId}?token=${authToken}`))
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }
          return await response.json()
        } catch (error) {
          throw error
        }
      },

      // 同期状態管理
      setSyncing: (isSyncing: boolean, playlistId?: string) => {
        set({ 
          isSyncing, 
          syncingPlaylistId: isSyncing ? playlistId : undefined 
        })
      },

      // データバックアップ・復元機能
      exportData: () => {
        const state = get()
        const exportData = {
          playlists: state.playlists,
          favorites: state.favorites,
          skippedTracks: state.skippedTracks,
          playHistory: state.playHistory,
          volume: state.volume,
          exportDate: new Date().toISOString(),
          version: '2.0.0'
        }
        return JSON.stringify(exportData, null, 2)
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData)
          
          if (!data.playlists || !Array.isArray(data.playlists)) {
            return false
          }

          set({
            playlists: data.playlists || [],
            favorites: data.favorites || [],
            skippedTracks: data.skippedTracks || [],
            playHistory: data.playHistory || [],
            volume: data.volume || 1,
            currentPlaylistId: undefined,
            audioFiles: [],
            currentTrack: 0
          })

          return true
        } catch (error) {
          return false
        }
      },

      clearAllData: () => {
        set({
          playlists: [],
          currentPlaylistId: undefined,
          audioFiles: [],
          currentTrack: 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          favorites: [],
          skippedTracks: [],
          playHistory: [],
          authToken: undefined,
          isSyncing: false,
          syncingPlaylistId: undefined
        })
        
        // 全てのローカルストレージをクリア
        localStorage.removeItem('player-storage')
        localStorage.removeItem('gdap-auth-token')
        
        // セッションストレージもクリア
        sessionStorage.clear()
      },

      // プレイリスト管理
      createPlaylist: (name: string, folderId: string, color?: string) => {
        const newPlaylist: Playlist = {
          id: `playlist_${Date.now()}`,
          name,
          folderId,
          color: color || PLAYLIST_COLORS[Math.floor(Math.random() * PLAYLIST_COLORS.length)],
          isShuffleMode: false,
          isRepeatMode: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set((state) => ({
          playlists: [...state.playlists, newPlaylist],
          currentPlaylistId: newPlaylist.id
        }))
        
        return newPlaylist.id
      },

      updatePlaylist: (id: string, updates: Partial<Playlist>) => {
        set((state) => ({
          playlists: state.playlists.map(playlist =>
            playlist.id === id
              ? { ...playlist, ...updates, updatedAt: new Date().toISOString() }
              : playlist
          )
        }))
      },

      deletePlaylist: (id: string) => {
        set((state) => ({
          playlists: state.playlists.filter(playlist => playlist.id !== id),
          currentPlaylistId: state.currentPlaylistId === id ? undefined : state.currentPlaylistId,
          audioFiles: state.audioFiles.filter(file => file.playlistId !== id)
        }))
      },

      setCurrentPlaylist: (id: string) => {
        set({ currentPlaylistId: id })
      },

      togglePlaylistShuffle: (id: string) => {
        const { updatePlaylist } = get()
        const playlist = get().playlists.find(p => p.id === id)
        if (playlist) {
          updatePlaylist(id, { isShuffleMode: !playlist.isShuffleMode })
        }
      },

      togglePlaylistRepeat: (id: string) => {
        const { updatePlaylist } = get()
        const playlist = get().playlists.find(p => p.id === id)
        if (playlist) {
          updatePlaylist(id, { isRepeatMode: !playlist.isRepeatMode })
        }
      },

      // 楽曲管理
      toggleFavorite: (fileId: string) => set((state) => ({
        favorites: state.favorites.includes(fileId)
          ? state.favorites.filter(id => id !== fileId)
          : [...state.favorites, fileId]
      })),

      toggleSkipped: (fileId: string) => set((state) => ({
        skippedTracks: state.skippedTracks.includes(fileId)
          ? state.skippedTracks.filter(id => id !== fileId)
          : [...state.skippedTracks, fileId]
      })),

      isSkipped: (fileId: string) => {
        return get().skippedTracks.includes(fileId)
      },

      isFavorite: (fileId: string) => {
        return get().favorites.includes(fileId)
      },

      getPlayableTracks: (playlistId?: string) => {
        const state = get()
        const targetPlaylistId = playlistId || state.currentPlaylistId
        if (!targetPlaylistId) return []
        
        return state.audioFiles.filter(file => 
          file.playlistId === targetPlaylistId && 
          !state.skippedTracks.includes(file.id)
        )
      },

      setAudioFiles: (files: AudioFile[]) => set({ audioFiles: files, currentTrack: 0 }),
      
      // フォルダ内の楽曲を確認する関数
      checkFolderAudioFiles: async (folderId: string): Promise<{ hasAudio: boolean; fileCount: number; error?: string }> => {
        const state = get()
        
        if (!state.authToken) {
          return { hasAudio: false, fileCount: 0, error: '認証が必要です' }
        }

        try {
          const { getApiUrl, getAuthUrl } = await import('@/config/env')
          const response = await fetch(getApiUrl(`/api/audio-files/${folderId}?token=${state.authToken}`))
          
          if (!response.ok) {
            if (response.status === 401) {
              // 全てのデータをクリア（プレイリストも含む）
              const { clearAllData } = get()
              clearAllData()
              
              window.location.href = getAuthUrl('login')
              return { hasAudio: false, fileCount: 0, error: '認証が期限切れです' }
            }
            
            // 404や500など、その他のエラーは全て同じメッセージ
            return { hasAudio: false, fileCount: 0, error: '対象のフォルダが有効ではありません' }
          }
          
          const files = await response.json()
          const audioFiles = Array.isArray(files) ? files : []
          
          return {
            hasAudio: audioFiles.length > 0,
            fileCount: audioFiles.length
          }
        } catch (error) {
          return {
            hasAudio: false,
            fileCount: 0,
            error: error instanceof Error ? error.message : '不明なエラーが発生しました'
          }
        }
      },
      
      loadPlaylistFiles: async (playlistId: string) => {
        const state = get()
        
        const playlist = state.playlists.find(p => p.id === playlistId)
        if (!playlist) {
          return
        }
        if (!state.authToken) {
          const { getAuthUrl } = await import('@/config/env')
          window.location.href = getAuthUrl('login')
          return
        }

        // 同期開始
        set({ isSyncing: true, syncingPlaylistId: playlistId })

        try {
          const { getApiUrl, getAuthUrl } = await import('@/config/env')
          const response = await fetch(getApiUrl(`/api/audio-files/${playlist.folderId}?token=${state.authToken}`))
          
          if (!response.ok) {
            const errorText = await response.text()
            
            if (response.status === 401) {
              // 全てのデータをクリア（プレイリストも含む）
              const { clearAllData } = get()
              clearAllData()
              
              // 認証ページにリダイレクト
              window.location.href = getAuthUrl('login')
              return
            }
            
            throw new Error(`API Error: ${response.status} - ${errorText}`)
          }
          
          const files = await response.json()
          
          const playlistFiles: AudioFile[] = files.map((file: any) => ({
            id: file.id,
            name: file.name,
            size: file.size,
            downloadUrl: getApiUrl(`/api/stream/${file.id}?token=${state.authToken}`),
            mimeType: file.mime_type,
            playlistId
          }))
          
          
          const oldState = get()
          
          set((state) => ({
            audioFiles: [
              ...state.audioFiles.filter(f => f.playlistId !== playlistId),
              ...playlistFiles
            ]
          }))
          
          const newState = get()
        } catch (error) {
          alert(`プレイリストの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
          // 同期完了
          set({ isSyncing: false, syncingPlaylistId: undefined })
        }
      },

      // プレイヤー制御（スキップ機能対応）
      playTrack: (indexOrId: number | string) => {
        const state = get()
        let index: number
        
        if (typeof indexOrId === 'string') {
          // fileIdが渡された場合、インデックスを見つける
          index = state.audioFiles.findIndex(file => file.id === indexOrId)
          if (index === -1) {
            return
          }
        } else {
          index = indexOrId
        }
        
        const currentFile = state.audioFiles[index]
        
        if (currentFile && state.skippedTracks.includes(currentFile.id)) {
          get().nextTrack()
          return
        }
        
        set({ 
          currentTrack: index, 
          intendedPlaying: true,
          isPlaying: false // 実際の再生状態は後でaudio要素のイベントで更新
        })
      },
      
      togglePlay: () => set((state) => ({ 
        intendedPlaying: !state.intendedPlaying 
      })),
      
      stopPlayback: () => set({ 
        intendedPlaying: false, 
        isPlaying: false,
        currentTime: 0
      }),
      
      nextTrack: () => set((state) => {
        const currentPlaylist = state.playlists.find(p => p.id === state.currentPlaylistId)
        const playableTracks = get().getPlayableTracks(state.currentPlaylistId)
        
        if (playableTracks.length === 0) return state
        
        let nextTrack: AudioFile
        if (currentPlaylist?.isShuffleMode) {
          nextTrack = playableTracks[Math.floor(Math.random() * playableTracks.length)]
        } else {
          const currentPlayableIndex = playableTracks.findIndex(track => 
            state.audioFiles.indexOf(track) === state.currentTrack
          )
          const nextIndex = (currentPlayableIndex + 1) % playableTracks.length
          nextTrack = playableTracks[nextIndex]
        }
        
        const actualIndex = state.audioFiles.indexOf(nextTrack)
        return { currentTrack: actualIndex, intendedPlaying: true, isPlaying: false }
      }),
      
      previousTrack: () => set((state) => {
        const playableTracks = get().getPlayableTracks(state.currentPlaylistId)
        
        if (playableTracks.length === 0) return state
        
        const currentPlayableIndex = playableTracks.findIndex(track => 
          state.audioFiles.indexOf(track) === state.currentTrack
        )
        const prevIndex = currentPlayableIndex === 0 ? playableTracks.length - 1 : currentPlayableIndex - 1
        const prevTrack = playableTracks[prevIndex]
        const actualIndex = state.audioFiles.indexOf(prevTrack)
        
        return { currentTrack: actualIndex, intendedPlaying: true, isPlaying: false }
      }),
      
      seekTo: (time: number) => set({ currentTime: time }),
      
      setVolume: (volume: number) => set({ volume })
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({ 
        playlists: state.playlists,
        currentPlaylistId: state.currentPlaylistId,
        favorites: state.favorites,
        skippedTracks: state.skippedTracks,
        playHistory: state.playHistory,
        volume: state.volume,
        authToken: state.authToken
      })
    }
  )
)

// デバッグ用：開発環境でwindowオブジェクトに公開
if (typeof window !== 'undefined') {
  (window as any).usePlayerStore = usePlayerStore
} 