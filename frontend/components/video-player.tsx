'use client'

import React, { useRef, useState, useEffect } from 'react'
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
  Sparkles,
} from 'lucide-react'

interface VideoPlayerProps {
  videoUrl?: string
  posterUrl?: string
  title?: string
  narration?: string
  hashtags?: string[]
  onDownload?: () => void
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title = 'Vídeo TikTok Gerado por IA',
  narration = '',
  hashtags = ['#fyp', '#viral', '#studioops'],
  onDownload,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy might require mute
          if (videoRef.current) {
            videoRef.current.muted = true
            setIsMuted(true)
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
          }
        })
    }
  }, [videoUrl])

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

  const toggleMute = () => {
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
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
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
        <strong className="text-base font-semibold text-white">Pronto para renderizar</strong>
        <p className="mt-1 text-xs text-white/50">
          Configure seu tema e clique no botão para renderizar o MP4 vertical 9:16
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black select-none">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        playsInline
        loop
        className="h-full w-full object-cover"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Play/Pause Overlay Flash */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl">
            <Play className="h-8 w-8 translate-x-0.5 fill-white text-white" />
          </div>
        </button>
      )}

      {/* Right TikTok Action Sidebar */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
        {/* Creator Avatar with Follow Plus */}
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#fe0979] to-[#00f2fe] text-xs font-bold shadow-md">
            SO
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#fe0979] text-[10px] text-white shadow">
            +
          </span>
        </div>

        {/* Like */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Curtir"
          className="group flex flex-col items-center gap-1"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90 ${
              isLiked ? 'text-[#fe0979]' : 'text-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#fe0979]' : ''}`} />
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-white/90">
            {isLiked ? '42.1K' : '42.0K'}
          </span>
        </button>

        {/* Comment */}
        <button aria-label="Comentários" className="group flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform active:scale-90">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-white/90">1.2K</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          aria-label="Salvar"
          className="group flex flex-col items-center gap-1"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90 ${
              isBookmarked ? 'text-amber-400' : 'text-white'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-white/90">
            {isBookmarked ? '8.4K' : '8.3K'}
          </span>
        </button>

        {/* Share */}
        <button aria-label="Compartilhar" className="group flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform active:scale-90">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-white/90">3.9K</span>
        </button>

        {/* Spinning Disc */}
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 bg-neutral-900 text-[#00f2fe] shadow-lg ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '4s' }}
        >
          <Music className="h-4 w-4" />
        </div>
      </div>

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-3 right-3 z-20 flex items-center justify-between">
        <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-[#00f2fe] backdrop-blur-md border border-[#00f2fe]/30">
          <Sparkles className="h-3 w-3" /> SDXL 9:16 + Edge-TTS
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleReplay}
            aria-label="Reiniciar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownloadFile}
            aria-label="Baixar MP4"
            title="Baixar MP4 final"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00f2fe]/90 text-black backdrop-blur-md font-bold transition-transform hover:scale-105 active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Info & Caption Overlay */}
      <div className="absolute bottom-4 left-3 right-16 z-20 text-white">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white drop-shadow">
          <span>@studioops_ai</span>
          <span className="inline-block h-1 w-1 rounded-full bg-white/60" />
          <span className="text-[10px] text-[#00f2fe]">Vídeo Oficial</span>
        </div>

        <p className="mt-1 line-clamp-2 text-xs font-medium text-white/95 drop-shadow leading-snug">
          {narration || title}
        </p>

        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold text-[#00f2fe] drop-shadow">
          {hashtags.slice(0, 4).map((tag, i) => (
            <span key={i}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/80">
          <Music className="h-3 w-3 animate-pulse text-[#00f2fe]" />
          <span className="truncate">Áudio Original — StudioOps AI Engine</span>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 h-1.5 cursor-pointer bg-white/20 transition-all hover:h-2.5"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-[#fe0979] to-[#00f2fe] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
