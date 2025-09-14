'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Music, MoreHorizontal, Edit3, Trash2, ChevronRight, Loader2, RotateCcw } from 'lucide-react'
import { usePlayerStore } from '@/stores/player-store'
import type { Playlist } from '@gdrive-audio-player/types'

interface PlaylistListProps {
  onSelectPlaylist: (playlistId: string) => void
}

export function PlaylistList({ onSelectPlaylist }: PlaylistListProps) {
    const {
    playlists,
    audioFiles,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    loadPlaylistFiles,
    isSyncing,
    syncingPlaylistId
  } = usePlayerStore()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistFolderId, setNewPlaylistFolderId] = useState('')
  const [editName, setEditName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)

  // Google Drive URLからフォルダIDを抽出する関数
  const extractFolderIdFromUrl = (input: string): string => {
    const trimmedInput = input.trim()
    
    // 既にフォルダIDの形式の場合はそのまま返す
    if (/^[a-zA-Z0-9_-]{28,}$/.test(trimmedInput)) {
      return trimmedInput
    }
    
    // Google Drive URLからフォルダIDを抽出
    const urlPatterns = [
      // 標準的なフォルダURL: https://drive.google.com/drive/folders/FOLDER_ID
      /\/folders\/([a-zA-Z0-9_-]{28,})/,
      // 共有リンク形式: https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
      /\/folders\/([a-zA-Z0-9_-]{28,})(?:\?|$)/,
      // 古い形式: https://drive.google.com/folderview?id=FOLDER_ID
      /[?&]id=([a-zA-Z0-9_-]{28,})/,
      // その他のGoogle Drive URL
      /drive\.google\.com\/.*\/([a-zA-Z0-9_-]{28,})/,
      // 短縮URL展開後の形式
      /\/([a-zA-Z0-9_-]{28,})(?:[?&#]|$)/
    ]
    
    for (const pattern of urlPatterns) {
      const match = trimmedInput.match(pattern)
      if (match && match[1] && /^[a-zA-Z0-9_-]{28,}$/.test(match[1])) {
        return match[1]
      }
    }
    
    return trimmedInput
  }
  
  // 初回読み込み時に楽曲が同期されていないプレイリストを自動同期
  useEffect(() => {
    playlists.forEach(playlist => {
      const hasAudioFiles = audioFiles.some(file => file.playlistId === playlist.id)
      const isCurrentlySyncing = isSyncing && syncingPlaylistId === playlist.id
      
      // 楽曲がなく、同期中でもない場合は自動同期
      if (!hasAudioFiles && !isCurrentlySyncing) {
        loadPlaylistFiles(playlist.id).catch(() => {})
      }
    })
  }, [playlists, audioFiles, isSyncing, syncingPlaylistId, loadPlaylistFiles])

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !newPlaylistFolderId.trim()) {
      setCreationError('プレイリスト名とフォルダID/URLを入力してください。')
      return
    }

    setIsCreating(true)
    setCreationError(null)

    try {
      // URLからフォルダIDを抽出
      const extractedFolderId = extractFolderIdFromUrl(newPlaylistFolderId)
      
      // フォルダIDの形式チェック
      if (!/^[a-zA-Z0-9_-]{28,}$/.test(extractedFolderId)) {
        setCreationError('有効なGoogle DriveフォルダIDまたはURLを入力してください。')
        return
      }

      // 重複チェック
      const existingPlaylist = playlists.find(p => p.folderId === extractedFolderId)
      if (existingPlaylist) {
        setCreationError(`このフォルダは既に「${existingPlaylist.name}」プレイリストで使用されています。`)
        return
      }

      // フォルダ内の楽曲を確認
      const store = usePlayerStore.getState()
      const checkResult = await (store as any).checkFolderAudioFiles(extractedFolderId)
      
      if (checkResult.error) {
        if (checkResult.error.includes('認証')) {
          // 認証エラーの場合はリダイレクトされるので何もしない
          return
        }
        // その他のエラーは全て同じメッセージ
        setCreationError('対象のフォルダが有効ではありません。フォルダIDまたはURLを確認してください。')
        return
      }

      if (!checkResult.hasAudio) {
        setCreationError('対象のフォルダが有効ではありません。フォルダIDまたはURLを確認してください。')
        return
      }

      // 楽曲が確認できた場合のみプレイリストを作成
      createPlaylist(newPlaylistName.trim(), extractedFolderId)
      
      // 作成されたプレイリストを取得して楽曲を同期
      const createdPlaylist = usePlayerStore.getState().playlists.find(p => p.folderId === extractedFolderId)
      if (createdPlaylist) {
        loadPlaylistFiles(createdPlaylist.id).catch(() => {})
      }
      
      setNewPlaylistName('')
      setNewPlaylistFolderId('')
      setShowCreateForm(false)
      setCreationError(null)
      
    } catch (error) {
      // 予期せぬエラーの場合はトップページにリダイレクト
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      alert(`エラーが発生しました: ${errorMessage}\nトップページに戻ります。`)
      window.location.href = '/'
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditPlaylist = (playlistId: string, currentName: string) => {
    setEditingName(playlistId)
    setEditName(currentName)
    setEditingPlaylist(null)
  }

  const handleSaveEdit = (playlistId: string) => {
    if (editName.trim()) {
      updatePlaylist(playlistId, { name: editName.trim() })
      setEditingName(null)
      setEditName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingName(null)
    setEditName('')
  }

  const getPlaylistTrackCount = (playlistId: string) => {
    return audioFiles.filter(file => file.playlistId === playlistId).length
  }

  const isPlaylistClickable = (playlistId: string) => {
    // 同期中の場合はクリック不可
    if (isSyncing && syncingPlaylistId === playlistId) {
      return false
    }
    // 楽曲が1曲以上ある場合のみクリック可能
    return getPlaylistTrackCount(playlistId) > 0
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">プレイリスト</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規作成</span>
            </button>
          </div>

                          {/* プレイリスト作成フォーム */}
                {showCreateForm && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="プレイリスト名"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      disabled={isCreating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Google Drive フォルダID / URL"
                        value={newPlaylistFolderId}
                        onChange={(e) => setNewPlaylistFolderId(e.target.value)}
                        disabled={isCreating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          フォルダID（例: 1ABC123def456GHI789jkl）またはGoogle DriveフォルダのURLを入力
                        </p>
                        {newPlaylistFolderId.trim() && (
                          <div className="text-xs">
                            {(() => {
                              const extractedId = extractFolderIdFromUrl(newPlaylistFolderId)
                              const isValidId = /^[a-zA-Z0-9_-]{28,}$/.test(extractedId)
                              const existingPlaylist = playlists.find(p => p.folderId === extractedId)
                              
                              if (isValidId && !existingPlaylist) {
                                return (
                                  <span className="text-green-600">
                                    ✓ フォルダID: {extractedId}
                                  </span>
                                )
                              } else if (isValidId && existingPlaylist) {
                                return (
                                  <span className="text-orange-600">
                                    ⚠ このフォルダは「{existingPlaylist.name}」で使用中
                                  </span>
                                )
                              } else if (extractedId !== newPlaylistFolderId.trim()) {
                                return (
                                  <span className="text-red-600">
                                    ✗ 無効なフォルダIDまたはURL
                                  </span>
                                )
                              }
                              return null
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* エラー表示 */}
                    {creationError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{creationError}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreatePlaylist}
                        disabled={isCreating}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            楽曲を確認中...
                          </>
                        ) : (
                          '作成'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateForm(false)
                          setCreationError(null)
                        }}
                        disabled={isCreating}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
        </div>
      </div>

      {/* プレイリスト一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 pb-32 sm:pb-24">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">プレイリストがありません</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                最初のプレイリストを作成
              </button>
            </div>
          ) : (
            playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className={`w-full flex items-center p-4 transition-colors ${
                isPlaylistClickable(playlist.id) 
                  ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm mr-4 flex-shrink-0 relative ${
                    isSyncing && syncingPlaylistId === playlist.id ? 'animate-pulse' : ''
                  }`}
                  style={{ backgroundColor: playlist.color }}
                >
                  {playlist.name.charAt(0).toUpperCase()}
                  {isSyncing && syncingPlaylistId === playlist.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Loader2 className="w-2 h-2 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  {editingName === playlist.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value.slice(0, 20))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(playlist.id)
                          } else if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                        className="w-full px-2 py-1 text-sm font-semibold border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="プレイリスト名（最大20文字）"
                        maxLength={20}
                        autoFocus
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelEdit()
                          }}
                          className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveEdit(playlist.id)
                          }}
                          className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isPlaylistClickable(playlist.id)) {
                          onSelectPlaylist(playlist.id)
                        }
                      }}
                      disabled={!isPlaylistClickable(playlist.id)}
                      className="w-full text-left disabled:cursor-not-allowed"
                    >
                      <h3 className="font-semibold text-gray-900 truncate" title={playlist.name}>
                        {playlist.name}
                      </h3>
                    </button>
                  )}
                  {editingName !== playlist.id && (
                    <div className="flex items-center space-x-2 text-sm">
                      {isSyncing && syncingPlaylistId === playlist.id ? (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>楽曲を同期中...</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">
                          {getPlaylistTrackCount(playlist.id) > 0 
                            ? `${getPlaylistTrackCount(playlist.id)}曲` 
                            : '楽曲を読み込み中...'
                          }
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 relative">
                  {/* 同期状態の表示 */}
                  {isSyncing && syncingPlaylistId === playlist.id ? (
                    <div className="flex items-center space-x-2 text-blue-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">同期中</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPlaylist(editingPlaylist === playlist.id ? null : playlist.id)
                        }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {!editingName && (
                        <button
                          onClick={() => {
                            if (isPlaylistClickable(playlist.id)) {
                              onSelectPlaylist(playlist.id)
                            }
                          }}
                          disabled={!isPlaylistClickable(playlist.id)}
                          className={`${
                            isPlaylistClickable(playlist.id) 
                              ? 'text-gray-400 hover:text-gray-600' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}

                  {editingPlaylist === playlist.id && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-36">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadPlaylistFiles(playlist.id)
                          setEditingPlaylist(null)
                        }}
                        disabled={isSyncing && syncingPlaylistId === playlist.id}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 w-full text-left"
                      >
                        {isSyncing && syncingPlaylistId === playlist.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        <span>楽曲を再同期</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditPlaylist(playlist.id, playlist.name)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>編集</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`「${playlist.name}」を削除しますか？`)) {
                            deletePlaylist(playlist.id)
                          }
                          setEditingPlaylist(null)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>削除</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
                      ))
          )}
        </div>
      </div>
    </div>
  )
} 