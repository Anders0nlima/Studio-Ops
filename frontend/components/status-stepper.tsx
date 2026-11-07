'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Film,
  Zap,
  RotateCcw,
} from 'lucide-react'
import { PipelineStep } from '@/types/studio'

interface StatusStepperProps {
  currentStep: PipelineStep
  statusMessage?: string
  progress?: number
  errorMessage?: string
  onRetry?: () => void
  onOpenSettings?: () => void
}

interface StepDef {
  key: PipelineStep
  label: string
  sublabel: string
  agent: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: StepDef[] = [
  {
    key: 'scripting',
    label: 'Roteirização TikTok',
    sublabel: 'Estruturação de ganchos em 3 cenas (0-15s)',
    agent: 'Roteirista Agent (Ollama)',
    icon: FileText,
  },
  {
    key: 'optimizing_seo',
    label: 'Otimização Viral & SEO',
    sublabel: 'Gatilhos mentais, copy de alta conversão e hashtags',
    agent: 'Growth Hacker (Ollama)',
    icon: Sparkles,
  },
  {
    key: 'dispatching_colab',
    label: 'Geração de Imagens & Áudio',
    sublabel: 'SDXL Turbo FP16 9:16 vertical + Edge-TTS Neural',
    agent: 'Colab Worker (T4 GPU)',
    icon: ImageIcon,
  },
  {
    key: 'rendering_video',
    label: 'Renderização Final MP4',
    sublabel: 'Zoom contínuo Ken Burns, mixagem e encode H.264',
    agent: 'MoviePy Engine (Colab)',
    icon: Film,
  },
]

export function StatusStepper({
  currentStep,
  statusMessage,
  progress = 0,
  errorMessage,
  onRetry,
  onOpenSettings,
}: StatusStepperProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    let interval: any = null
    if (currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentStep])

  const stepOrder: Record<PipelineStep, number> = {
    idle: 0,
    scripting: 1,
    optimizing_seo: 2,
    dispatching_colab: 3,
    rendering_video: 4,
    completed: 5,
    error: -1,
  }

  const currentStepNum = stepOrder[currentStep] || 0

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-neutral-900/90 p-5 backdrop-blur-xl shadow-2xl">
      {/* Header with Title and Elapsed Timer */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#fe0979] to-[#00f2fe] text-white">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pipeline Autônomo StudioOps</h3>
            <p className="text-xs text-white/50">Orquestração em nuvem multi-agente</p>
          </div>
        </div>

        {currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error' && (
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono font-medium text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <span>{elapsedSeconds}s decorridos</span>
          </div>
        )}
      </div>

      {/* Dynamic Progress Bar */}
      <div className="my-4">
        <div className="flex items-center justify-between text-xs font-semibold text-white/70 mb-1.5">
          <span>{statusMessage || 'Processando pipeline...'}</span>
          <span className="font-mono text-[#00f2fe]">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#fe0979] via-[#9d4edd] to-[#00f2fe] transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
      </div>

      {/* Stepper Steps List */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {STEPS.map((step, idx) => {
          const stepIndex = idx + 1
          const isDone = currentStepNum > stepIndex || currentStep === 'completed'
          const isActive = currentStepNum === stepIndex
          const isPending = currentStepNum < stepIndex && currentStep !== 'completed'
          const Icon = step.icon

          return (
            <div
              key={step.key}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-[#00f2fe]/60 bg-gradient-to-b from-[#00f2fe]/10 to-transparent shadow-lg shadow-[#00f2fe]/5'
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-white/80'
                  : 'border-white/5 bg-white/[0.02] opacity-50'
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? 'bg-[#00f2fe] text-black shadow-md shadow-[#00f2fe]/40'
                    : isDone
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{step.label}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-white/50 line-clamp-2">
                  {step.sublabel}
                </p>
                <span className="mt-1 inline-block text-[10px] font-medium text-cyan-400/80">
                  {step.agent}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error Banner with Friendly Guidance */}
      {currentStep === 'error' && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <strong className="text-sm font-semibold text-red-300">
                Aviso de Conexão ou Execução
              </strong>
              <p className="mt-1 text-xs text-red-200/80 leading-relaxed">
                {errorMessage ||
                  'O servidor Colab ou n8n não respondeu a tempo. Se o Colab estiver desligado, você pode ativá-lo ou verificar a URL do Ngrok.'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500/50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Tentar novamente
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-200 transition-colors hover:bg-white/10"
                  >
                    Configurar URL do Colab / Ngrok
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
