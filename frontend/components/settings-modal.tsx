'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Settings,
  Server,
  Cpu,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { ConnectionConfig } from '@/types/studio'
import { getStoredConfig, saveStoredConfig } from '@/services/api'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: ConnectionConfig) => void
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [config, setConfig] = useState<ConnectionConfig>(getStoredConfig())
  const [isTesting, setIsTesting] = useState(false)
  const [colabStatus, setColabStatus] = useState<'idle' | 'online' | 'offline'>('idle')
  const [colabDevice, setColabDevice] = useState<string>('')
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'online' | 'offline'>('idle')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredConfig())
      setIsSaved(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTestConnections = async () => {
    setIsTesting(true)
    setColabStatus('idle')
    setN8nStatus('idle')

    // Test Colab Worker
    if (config.colabUrl) {
      try {
        const cleanUrl = config.colabUrl.replace(/\/$/, '')
        const res = await fetch(`${cleanUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(6000),
        })
        if (res.ok) {
          const data = await res.json()
          setColabStatus('online')
          setColabDevice(data.device || 'cuda:0 (T4)')
        } else {
          setColabStatus('offline')
        }
      } catch (err) {
        console.warn('Colab health check failed:', err)
        setColabStatus('offline')
      }
    } else {
      setColabStatus('offline')
    }

    // Test n8n
    if (config.n8nUrl) {
      try {
        const cleanUrl = config.n8nUrl.replace(/\/$/, '')
        const res = await fetch(`${cleanUrl}/webhook/trends`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ping: true }),
          signal: AbortSignal.timeout(6000),
        })
        if (res.ok || res.status === 404 || res.status === 200) {
          setN8nStatus('online')
        } else {
          setN8nStatus('offline')
        }
      } catch (err) {
        // Many browsers block localhost CORS in dev, but if running with same origin or handled:
        console.warn('n8n ping failed:', err)
        setN8nStatus('offline')
      }
    }

    setIsTesting(false)
  }

  const handleSave = () => {
    saveStoredConfig(config)
    setIsSaved(true)
    if (onSave) onSave(config)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fe0979] to-[#00f2fe] text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Conexões & Nuvem</h2>
              <p className="text-xs text-white/50">
                Configure os endpoints do Colab (Ngrok) e n8n
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar configurações"
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Colab Ngrok Endpoint */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="colab-url-input" className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Server className="h-3.5 w-3.5 text-[#00f2fe]" /> URL do Google Colab (Ngrok)
              </label>
              {colabStatus === 'online' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Online ({colabDevice || 'GPU T4'})
                </span>
              )}
              {colabStatus === 'offline' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-red-400">
                  <XCircle className="h-3 w-3" /> Inacessível
                </span>
              )}
            </div>
            <input
              id="colab-url-input"
              type="text"
              placeholder="https://xxxx-xx-xx.ngrok-free.app"
              value={config.colabUrl}
              onChange={(e) => setConfig({ ...config, colabUrl: e.target.value.trim() })}
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
            />
            <p className="mt-1 text-[11px] text-white/40">
              Copie a URL pública gerada na Célula 4 do notebook Colab StudioOps.
            </p>
          </div>

          {/* n8n Orchestrator Endpoint */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="n8n-url-input" className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Globe className="h-3.5 w-3.5 text-[#fe0979]" /> URL do n8n Local
              </label>
              {n8nStatus === 'online' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Conectado
                </span>
              )}
              {n8nStatus === 'offline' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                  <HelpCircle className="h-3 w-3" /> Local / Fallback ativo
                </span>
              )}
            </div>
            <input
              id="n8n-url-input"
              type="text"
              placeholder="http://localhost:5678"
              value={config.n8nUrl}
              onChange={(e) => setConfig({ ...config, n8nUrl: e.target.value.trim() })}
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#fe0979] focus:outline-none focus:ring-1 focus:ring-[#fe0979]"
            />
          </div>

          {/* Ollama Model */}
          <div>
            <label htmlFor="ollama-model-input" className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mb-1.5">
              <Cpu className="h-3.5 w-3.5 text-purple-400" /> Modelo Local do Ollama
            </label>
            <input
              id="ollama-model-input"
              type="text"
              value={config.ollamaModel}
              onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value.trim() })}
              placeholder="llama3.2:3b"
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={handleTestConnections}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
            Testar Conexões
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-medium text-white/60 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#fe0979] to-[#00f2fe] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#00f2fe]/20 transition-transform active:scale-95"
            >
              {isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
