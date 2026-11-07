'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { getStoredConfig } from '@/services/api'

interface VideoPlayerProps {
  videoUrl?: string
  posterUrl?: string
  title?: string
  narration?: string
  hashtags?: string[]
  onDownload?: () => void
  onOpenSettings?: () => void
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title = 'Vídeo TikTok Gerado por IA',
  narration = '',
  hashtags = ['#fyp', '#viral', '#studioops'],
  onDownload,
  onOpenSettings,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false) // Clean mode by default for best UX
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

  // Resolve best streaming URL: route through local Next.js proxy to eliminate CORS
  const resolvedSrc = useMemo(() => {
    if (!videoUrl) return null
    if (videoUrl.startsWith('/api/') || videoUrl.startsWith('blob:')) {
      return videoUrl
    }

    const cfg = getStoredConfig()
    const targetBase = cfg.colabUrl || ''
    if (videoUrl.includes('/video/')) {
      const filename = videoUrl.split('/video/').pop()?.split('?')[0]
      if (filename && targetBase) {
        return `/api/colab/video/${filename}?colabUrl=${encodeURIComponent(targetBase)}`
      }
    }

    return videoUrl
  }, [videoUrl])

  useEffect(() => {
    setMediaError(null)
    if (resolvedSrc && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true
            setIsMuted(true)
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
          }
        })
    }
  }, [resolvedSrc])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration || 15)
    setMediaError(null)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newFraction = Math.max(0, Math.min(1, clickX / rect.width))
    videoRef.current.currentTime = newFraction * duration
  }

  const handleReplay = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play()
    setIsPlaying(true)
  }

  const handleDownloadFile = () => {
    if (onDownload) {
      onDownload()
      return
    }
    const downloadTarget = resolvedSrc || videoUrl
    if (!downloadTarget) return
    const a = document.createElement('a')
    a.href = downloadTarget
    a.download = `studioops-${Date.now()}.mp4`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!videoUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#fe0979] to-[#00f2fe] text-white shadow-lg shadow-[#00f2fe]/20">
          <Play className="h-8 w-8 translate-x-0.5 fill-white text-white" />
        </div>
        <strong className="text-sm font-semibold text-white">Pronto para renderizar</strong>
        <p className="mt-1 text-xs text-white/50 leading-relaxed max-w-[200px]">
          Escolha o tema e clique em gerar para renderizar o MP4 vertical 9:16
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Smartphone Frame */}
      <div className="phone-preview group">
        {/* Top Status Bar (Speaker Notch) */}
        <div className="phone-top">
          <span>9:41</span>
          <div className="h-2.5 w-14 rounded-full bg-black/80 border border-white/10" />
          <span>●●●</span>
        </div>

        {/* Video Element */}
        {resolvedSrc && (
          <video
            ref={videoRef}
            src={resolvedSrc}
            poster={posterUrl}
            playsInline
            loop
            className="h-full w-full object-cover cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              console.warn('Video tag playback warning:', e)
              setMediaError('O túnel do Google Colab está offline ou o vídeo não pôde ser carregado.')
            }}
          />
        )}

        {/* Clean Mode Floating Sound Badge (Top Right) */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Ativar som' : 'Silenciar'}
          className="absolute top-9 right-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/15 transition-transform hover:scale-110 active:scale-95 shadow-md"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-amber-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#00f2fe]" />}
        </button>

        {/* Subtle Play/Pause Flash when paused */}
        {!isPlaying && !mediaError && (
          <button
            onClick={togglePlay}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 transition-opacity hover:bg-black/35"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
              <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
            </div>
          </button>
        )}

        {/* TikTok Mockup Overlay (Toggled ON/OFF) */}
        {showOverlay && !mediaError && (
          <>
            {/* Right TikTok Icons Column */}
            <div className="absolute right-2 bottom-14 z-20 flex flex-col items-center gap-3 text-white pointer-events-auto">
              {/* Creator Avatar */}
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-gradient-to-br from-[#fe0979] to-[#00f2fe] text-[10px] font-bold shadow-md">
                  SO
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#fe0979] text-[9px] font-bold text-white shadow">
                  +
                </span>
              </div>

              {/* Like */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90 ${
                    isLiked ? 'text-[#fe0979]' : 'text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#fe0979]' : ''}`} />
                </div>
                <span className="text-[9px] font-semibold text-white/90">
                  {isLiked ? '42.1K' : '42.0K'}
                </span>
              </button>

              {/* Comment */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-semibold text-white/90">1.2K</span>
              </div>

              {/* Bookmark */}
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90 ${
                    isBookmarked ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                </div>
                <span className="text-[9px] font-semibold text-white/90">
                  {isBookmarked ? '8.4K' : '8.3K'}
                </span>
              </button>

              {/* Share */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
                  <Share2 className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-semibold text-white/90">3.9K</span>
              </div>

              {/* Spinning Disc */}
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-neutral-900 text-[#00f2fe] shadow-lg ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <Music className="h-3 w-3" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-4 left-3 right-12 z-20 text-white pointer-events-none">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white drop-shadow">
                <span>@studioops</span>
                <span className="text-[9px] text-[#00f2fe] font-semibold">Oficial</span>
              </div>

              <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-white/90 drop-shadow leading-tight">
                {narration || title}
              </p>

              <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-semibold text-[#00f2fe] drop-shadow">
                {hashtags.slice(0, 3).map((tag, i) => (
                  <span key={i}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Clean Mode Bottom Discrete Bar (Title Hook) */}
        {!showOverlay && !mediaError && (
          <div className="absolute bottom-3 left-3 right-3 z-20 text-white pointer-events-none">
            <p className="line-clamp-1 text-[10px] font-medium text-white/80 drop-shadow">
              {title}
            </p>
          </div>
        )}

        {/* Interactive Progress Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 h-1 cursor-pointer bg-white/20 transition-all hover:h-2"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-[#fe0979] to-[#00f2fe] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Home Indicator */}
        <div className="phone-bottom">
          <span />
        </div>

        {/* Error Overlay if connection dropped */}
        {mediaError && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 p-4 text-center text-white">
            <AlertCircle className="h-8 w-8 text-amber-400 mb-2" />
            <strong className="text-xs font-semibold text-amber-300">
              Conexão com o Colab Necessária
            </strong>
            <p className="text-[10px] text-white/70 mt-1 mb-3 leading-relaxed">
              {mediaError}
            </p>
            <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
              <button
                onClick={() => {
                  setMediaError(null)
                  if (videoRef.current) {
                    videoRef.current.load()
                    videoRef.current.play().catch(() => {})
                  }
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                <RotateCcw className="h-3 w-3" /> Tentar recarregar
              </button>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="rounded-lg border border-[#00f2fe]/40 px-3 py-1.5 text-xs font-medium text-[#00f2fe] hover:bg-[#00f2fe]/10"
                >
                  Verificar URL do Ngrok
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* External Action Controls Bar (Located OUTSIDE the phone for flawless UX) */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2 shadow-lg backdrop-blur-md">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          title="Reiniciar vídeo"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Ativar som' : 'Silenciar'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4 text-[#00f2fe]" />}
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

        {/* Toggle TikTok Mockup vs Clean View */}
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          title={showOverlay ? 'Ocultar interface TikTok' : 'Mostrar interface TikTok'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            showOverlay
              ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {showOverlay ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{showOverlay ? 'Modo Limpo' : 'Interface TikTok'}</span>
        </button>

        {/* Download MP4 Button (Highlight) */}
        <button
          onClick={handleDownloadFile}
          title="Baixar arquivo MP4 em alta definição"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fe0979] to-[#00f2fe] px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-[#00f2fe]/20 transition-transform active:scale-95 hover:brightness-110 ml-1"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Baixar MP4</span>
        </button>
      </div>
    </div>
  )
}
