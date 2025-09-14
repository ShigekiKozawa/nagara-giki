import { z } from 'zod'

// Zodスキーマ定義
export const audioFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.string(),
  downloadUrl: z.string().url(),
  mimeType: z.string(),
  playlistId: z.string() // どのプレイリストに属するか
})

export const playlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  folderId: z.string(),
  color: z.string().optional(), // プレイリストのテーマカラー
  isShuffleMode: z.boolean(),
  isRepeatMode: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const playerStateSchema = z.object({
  playlists: z.array(playlistSchema),
  currentPlaylistId: z.string().optional(),
  audioFiles: z.array(audioFileSchema),
  currentTrack: z.number().min(0),
  isPlaying: z.boolean(),
  currentTime: z.number().min(0),
  duration: z.number().min(0),
  volume: z.number().min(0).max(1),
  favorites: z.array(z.string()), // グローバルお気に入り
  skippedTracks: z.array(z.string()), // スキップ楽曲（再生時に自動で飛ばされる）
  playHistory: z.array(z.string())
})

export const settingsSchema = z.object({
  apiKey: z.string().optional(),
  devMode: z.boolean()
})

// TypeScript型定義
export type AudioFile = z.infer<typeof audioFileSchema>
export type Playlist = z.infer<typeof playlistSchema>
export type PlayerState = z.infer<typeof playerStateSchema>
export type Settings = z.infer<typeof settingsSchema>

// API レスポンス型
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: 'success' | 'error'
}

// プレイリストアクション型
export interface PlaylistActions {
  createPlaylist: (name: string, folderId: string, color?: string) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  setCurrentPlaylist: (id: string) => void
  togglePlaylistShuffle: (id: string) => void
  togglePlaylistRepeat: (id: string) => void
}

// 楽曲管理アクション型
export interface TrackActions {
  toggleFavorite: (fileId: string) => void
  toggleSkipped: (fileId: string) => void
  isSkipped: (fileId: string) => boolean
  isFavorite: (fileId: string) => boolean
}

// データバックアップ・復元アクション型
export interface BackupActions {
  exportData: () => string
  importData: (jsonData: string) => boolean
  clearAllData: () => void
}

// 認証関連アクション型
export interface AuthActions {
  setAuthToken: (token: string) => void
  clearAuth: () => void
  validateFolder: (folderId: string) => Promise<{isValid: boolean, audioCount: number, folderName: string, error?: string}>
}

// 同期関連アクション型
export interface SyncActions {
  setSyncing: (isSyncing: boolean, playlistId?: string) => void
}

// プレイヤーアクション型
export interface PlayerActions extends PlaylistActions, TrackActions, BackupActions, AuthActions, SyncActions {
  setAudioFiles: (files: AudioFile[]) => void
  checkFolderAudioFiles: (folderId: string) => Promise<{ hasAudio: boolean; fileCount: number; error?: string }>
  playTrack: (indexOrId: number | string) => void
  togglePlay: () => void
  stopPlayback: () => void
  nextTrack: () => void
  previousTrack: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  loadPlaylistFiles: (playlistId: string) => Promise<void>
  getPlayableTracks: (playlistId?: string) => AudioFile[]
}

// ストレージキー定数
export const STORAGE_KEYS = {
  PLAYLISTS: 'audioPlayerPlaylists',
  FAVORITES: 'audioPlayerFavorites',
  SKIPPED_TRACKS: 'audioPlayerSkippedTracks',
  HISTORY: 'audioPlayerHistory',
  SETTINGS: 'audioPlayerSettings',
  CURRENT_PLAYLIST: 'audioPlayerCurrentPlaylist'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

// Apple Music風のカラーパレット
export const PLAYLIST_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Mint
  '#32D74B', // Light Green
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Violet
  '#FF2D92', // Pink
  '#A2845E', // Brown
  '#8E8E93'  // Gray
] as const

// 対応音声ファイル形式
export const SUPPORTED_AUDIO_FORMATS = {
  MP3: 'audio/mpeg',
  M4A: 'audio/mp4',
  AAC: 'audio/aac',
  WAV: 'audio/wav',
  FLAC: 'audio/flac',
  OGG: 'audio/ogg',
  WMA: 'audio/x-ms-wma'
} as const

export type SupportedAudioFormat = typeof SUPPORTED_AUDIO_FORMATS[keyof typeof SUPPORTED_AUDIO_FORMATS]

// 楽曲の表示状態
export enum TrackVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  SKIPPED = 'skipped'
} 