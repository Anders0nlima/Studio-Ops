'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Film,
  Gauge,
  Menu,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
  WandSparkles,
  X,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

import {
  Tab,
  TrendItem,
  VisualStyle,
  MetricCardData,
  PerformanceTip,
  AgentInfo,
  PipelineStep,
  GeneratedScript,
  GrowthMetadata,
  ConnectionConfig,
} from '@/types/studio'
import {
  MOCK_TRENDS,
  VISUAL_STYLES,
  MOCK_METRICS,
  MOCK_TIPS,
  MOCK_AGENTS,
} from '@/mocks/studio-data'
import {
  fetchTrendsApi,
  generateScriptApi,
  dispatchMediaRenderApi,
  pollJobStatusApi,
  analyzeMetricsApi,
  getStoredConfig,
} from '@/services/api'
import { VideoPlayer } from './video-player'
import { StatusStepper } from './status-stepper'
import { SettingsModal } from './settings-modal'

/* =========================================================================
   1. SIDEBAR COMPONENT
   ========================================================================= */

interface SidebarProps {
  tab: Tab
  setTab: (tab: Tab) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  agents: AgentInfo[]
  onOpenSettings: () => void
  hasColabConfigured: boolean
}

function Sidebar({
  tab,
  setTab,
  mobileOpen,
  setMobileOpen,
  agents,
  onOpenSettings,
  hasColabConfigured,
}: SidebarProps) {
  const items = [
    { id: 'trends' as Tab, label: 'Tendências do Dia', icon: TrendingUp },
    { id: 'studio' as Tab, label: 'Estúdio de Criação', icon: WandSparkles },
    { id: 'metrics' as Tab, label: 'Métricas & Insights', icon: BarChart3 },
  ]

  const onlineCount = agents.filter((a) => a.status === 'online').length

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles />
          </div>
          <span>
            studio<span className="brand-accent">ops</span>
          </span>
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar navegação"
          >
            <X />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">SO</div>
          <div>
            <strong>StudioOps Core</strong>
            <small>Workspace autônomo</small>
          </div>
          <ChevronDown className="workspace-chevron" />
        </div>

        <nav className="nav-list" aria-label="Navegação principal">
          <span className="nav-label">Workspace</span>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${tab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setTab(item.id)
                  setMobileOpen(false)
                }}
              >
                <Icon />
                <span>{item.label}</span>
                {item.id === 'trends' && <span className="new-dot" />}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="agent-status" onClick={onOpenSettings} role="button" tabIndex={0}>
            <span className={`online-dot ${hasColabConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div>
              <strong>Agentes online</strong>
              <small>
                {hasColabConfigured ? 'Ollama + Colab T4 Online' : 'Ollama Online (Colab pendente)'}
              </small>
            </div>
            <ChevronDown />
          </div>

          <button className="nav-item" onClick={onOpenSettings}>
            <Settings />
            <span>Configurações</span>
            {hasColabConfigured && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <a
            href="https://github.com/Anders0nlima/Studio-Ops"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
          >
            <CircleHelp />
            <span>Repositório GitHub</span>
          </a>

          <div className="profile">
            <div className="profile-avatar">OP</div>
            <div>
              <strong>Creator Studio</strong>
              <small>Modo Autônomo 100% Free</small>
            </div>
            <ChevronDown />
          </div>
        </div>
      </aside>
    </>
  )
}

/* =========================================================================
   2. HEADER COMPONENT
   ========================================================================= */

function Header({
  tab,
  onMenu,
  onOpenSettings,
}: {
  tab: Tab
  onMenu: () => void
  onOpenSettings: () => void
}) {
  const titles: Record<Tab, [string, string]> = {
    trends: [
      'Tendências do Dia',
      'Descubra os ganchos e estéticas que estão capturando a atenção no TikTok agora.',
    ],
    studio: [
      'Estúdio de Criação',
      'Transforme uma ideia em um vídeo curto de 15s de alta retenção pronto para postar.',
    ],
    metrics: [
      'Métricas & Insights de IA',
      'Analise a retenção de 0-3 segundos via CSV e receba diagnósticos automáticos.',
    ],
  }

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu />
      </button>

      <div>
        <div className="breadcrumbs">
          <span>Workspace</span>
          <span>/</span>
          <strong>{titles[tab][0]}</strong>
        </div>
        <p className="header-subtitle">{titles[tab][1]}</p>
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          onClick={onOpenSettings}
          title="Configurações de Conexão (Ngrok / n8n)"
          aria-label="Configurações"
        >
          <Settings />
        </button>
        <button className="icon-button notification" aria-label="Notificações">
          <Bell />
          <span />
        </button>
        <div className="top-avatar">OP</div>
      </div>
    </header>
  )
}

/* =========================================================================
   3. TRENDS SECTION
   ========================================================================= */

function TrendsSection({
  onSelectTrend,
}: {
  onSelectTrend: (tag: string, insight: string) => void
}) {
  const [trends, setTrends] = useState<TrendItem[]>(MOCK_TRENDS)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<string>('carregando...')

  const loadTrends = async () => {
    setLoading(true)
    const result = await fetchTrendsApi()
    setTrends(result.trends)
    setDataSource(result.source === 'n8n_live' ? 'n8n Webhook (Tempo Real)' : 'Coolhunter Local')
    setLoading(false)
  }

  useEffect(() => {
    loadTrends()
  }, [])

  return (
    <section className="content">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            COOLHUNTER AGENT <span className="live-pill">LIVE</span>
          </div>
          <h1>
            Tendências recomendadas <span>por IA</span>
          </h1>
          <p>
            O Coolhunter Agent analisou dados de engajamento para encontrar ganchos virais com alto potencial de retenção ({dataSource}).
          </p>
        </div>
        <button
          className="date-button flex items-center gap-1.5"
          onClick={loadTrends}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar tendências'}
        </button>
      </div>

      <div className="trend-grid">
        {trends.map((trend) => (
          <article className="trend-card" key={trend.id}>
            <div
              className="trend-image"
              style={{ backgroundImage: `url(${trend.image})` }}
            >
              <div className="trend-image-overlay" />
              <span className={`growth-badge ${trend.color}`}>
                {trend.growth} hoje
              </span>
              <button
                className="more-button"
                aria-label={`Mais opções para ${trend.tag}`}
              >
                •••
              </button>
            </div>

            <div className="trend-card-body">
              <div className="trend-title-row">
                <h2>{trend.tag}</h2>
                <TrendingUp className="trend-arrow" />
              </div>
              <p>{trend.insight}</p>
              <button
                className="create-button"
                onClick={() => onSelectTrend(trend.tag, trend.insight)}
              >
                <Sparkles /> Criar vídeo sobre isso
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* =========================================================================
   4. STUDIO SECTION (END-TO-END AUTOMATED PIPELINE)
   ========================================================================= */

function StudioSection({
  initialIdea,
  styles,
  onOpenSettings,
}: {
  initialIdea: string
  styles: VisualStyle[]
  onOpenSettings: () => void
}) {
  const [idea, setIdea] = useState(initialIdea)
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0)
  const [duration, setDuration] = useState<'5s' | '10s' | '15s'>('15s')
  const [voice, setVoice] = useState('pt-BR-FranciscaNeural (Ultra-realista)')

  // Pipeline states
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  // Generated Outputs
  const [generatedTitle, setGeneratedTitle] = useState(
    'POV: Quando você descobre que IA pode gerar seu vídeo completo em segundos'
  )
  const [generatedDesc, setGeneratedDesc] = useState(
    "Descubra a tecnologia que está transformando criadores em fenômenos virais. Comente 'TESTAR' para receber agora! #TikTok #CreatorEconomy"
  )
  const [generatedTags, setGeneratedTags] = useState(
    '#fyp #viral #trending #ia #criatividade #studioops #automacao'
  )
  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [copiedKey, setCopiedKey] = useState('')

  useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea)
    }
  }, [initialIdea])

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1500)
  }

  const handleGenerate = async () => {
    const config = getStoredConfig()
    setErrorMessage(undefined)
    setPipelineStep('scripting')
    setStatusMessage('Roteirista Agent (Ollama) estruturando ganchos (0-3s)...')
    setProgress(15)

    try {
      const selectedStyle = styles[selectedStyleIndex]?.name || 'Cyberpunk'
      const voiceId = voice.split(' ')[0]

      // Step 1: Generate Script & Growth SEO via n8n/Ollama
      const scriptResult = await generateScriptApi(
        idea || 'Como a inteligência artificial cria vídeos em segundos',
        selectedStyle,
        duration,
        voiceId
      )

      setPipelineStep('optimizing_seo')
      setStatusMessage('Growth Hacker otimizando título com gatilho e hashtags virais...')
      setProgress(35)

      // Update UI with Generated Script & SEO Metadata
      if (scriptResult.growth) {
        setGeneratedTitle(scriptResult.growth.title)
        setGeneratedDesc(scriptResult.growth.description)
        setGeneratedTags(scriptResult.growth.hashtags.join(' '))
      }

      // Step 2: Dispatch to Colab Media Engine
      setPipelineStep('dispatching_colab')
      setStatusMessage('Colab GPU T4 gerando 3 imagens SDXL Turbo 9:16 e áudio Edge-TTS...')
      setProgress(60)

      const dispatchResult = await dispatchMediaRenderApi(
        scriptResult.script,
        scriptResult.growth,
        voiceId,
        config.colabUrl
      )

      if (dispatchResult.source === 'colab_live' && dispatchResult.jobId) {
        // Step 3: Poll Colab Job until Finished
        setPipelineStep('rendering_video')
        setStatusMessage('Renderizando MP4 com MoviePy e efeitos de zoom contínuo...')
        setProgress(75)

        const jobId = dispatchResult.jobId
        let attempts = 0
        const maxAttempts = 80 // 280 seconds max

        const pollInterval = setInterval(async () => {
          attempts++
          try {
            const statusRes = await pollJobStatusApi(jobId, config.colabUrl)
            if (statusRes.status === 'completed' && statusRes.videoUrl) {
              clearInterval(pollInterval)
              setProgress(100)
              setVideoUrl(statusRes.videoUrl)
              setPipelineStep('completed')
              setStatusMessage('🎉 Vídeo vertical 9:16 renderizado com sucesso!')
            } else if (statusRes.status === 'error') {
              clearInterval(pollInterval)
              setPipelineStep('error')
              setErrorMessage(statusRes.error || 'Erro durante a renderização no Colab.')
            } else {
              // Update progressive feedback
              const dynamicProgress = Math.min(95, 75 + Math.floor(attempts * 1.2))
              setProgress(dynamicProgress)
              setStatusMessage(`Processando no Colab T4 (${statusRes.status})... ${Math.round(attempts * 3.5)}s`)
            }
          } catch (pollErr) {
            console.warn('Poll error:', pollErr)
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setPipelineStep('error')
            setErrorMessage(
              'Tempo limite de renderização atingido. Verifique se o Colab está ativo e com o Ngrok conectado.'
            )
          }
        }, 3500)
      } else {
        // Fallback simulation: local preview video
        setTimeout(() => {
          setPipelineStep('rendering_video')
          setStatusMessage('Finalizando mixagem de áudio e vídeo...')
          setProgress(90)

          setTimeout(() => {
            setProgress(100)
            setPipelineStep('completed')
            setStatusMessage('Vídeo demonstrativo gerado com sucesso!')
            setVideoUrl(
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            )
          }, 2000)
        }, 2500)
      }
    } catch (err: any) {
      console.error('Generation pipeline error:', err)
      setPipelineStep('error')
      setErrorMessage(
        err?.message ||
          'Não foi possível concluir o pipeline. Verifique as configurações de conexão.'
      )
    }
  }

  const isGenerating =
    pipelineStep === 'scripting' ||
    pipelineStep === 'optimizing_seo' ||
    pipelineStep === 'dispatching_colab' ||
    pipelineStep === 'rendering_video'

  return (
    <section className="content studio-content">
      <div className="studio-grid">
        {/* Left Input Panel */}
        <div className="studio-panel input-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow purple">
                <Sparkles /> ROTEIRISTA & PROMPT AGENT
              </div>
              <h1>Qual é a sua ideia?</h1>
            </div>
            <span className="step-count">
              01 <span>/ 03</span>
            </span>
          </div>

          <label className="field-label" htmlFor="idea-input">
            Descreva seu vídeo ou escolha uma tendência
          </label>
          <textarea
            id="idea-input"
            className="idea-textarea"
            placeholder="Ex: Como a inteligência artificial está transformando a criação de conteúdo em 2026..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />

          <div className="field-top">
            <label className="field-label">Escolha o estilo visual da IA</label>
            <button className="text-action" onClick={onOpenSettings}>
              <Plus /> Configurar Ngrok / Nuvem
            </button>
          </div>

          <div className="style-grid">
            {styles.map((style, index) => (
              <button
                key={style.id}
                className={`style-card ${style.className} ${
                  selectedStyleIndex === index ? 'selected' : ''
                }`}
                onClick={() => setSelectedStyleIndex(index)}
              >
                <span className="style-glow" />
                <span>{style.name}</span>
                {selectedStyleIndex === index && (
                  <span className="selected-check">
                    <Check />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="controls-row">
            <div>
              <label className="field-label">Duração recomendada</label>
              <div className="segmented">
                {(['5s', '10s', '15s'] as const).map((d) => (
                  <button
                    key={d}
                    className={duration === d ? 'selected' : ''}
                    onClick={() => setDuration(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Sintetizador de Voz</label>
              <button
                className="select-button"
                onClick={() =>
                  setVoice((prev) =>
                    prev.includes('Francisca')
                      ? 'pt-BR-AntonioNeural (Masculino Energético)'
                      : 'pt-BR-FranciscaNeural (Ultra-realista)'
                  )
                }
              >
                <span>{voice.split(' ')[0]}</span>
                <ChevronDown />
              </button>
            </div>
          </div>

          <button
            className="generate-button"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            <Zap className={isGenerating ? 'animate-bounce' : ''} />
            {isGenerating ? 'Orquestrando Agentes de IA...' : 'Gerar vídeo para TikTok'}
            <Sparkles />
          </button>

          <p className="generation-note">
            <Gauge /> Geração média: 45–90 segundos (GPU T4 Colab via Ngrok)
          </p>
        </div>

        {/* Right Output Panel */}
        <div className="studio-panel output-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow cyan">
                <Film /> OUTPUT PREVIEW (9:16 VERTICAL)
              </div>
              <h1>Resultado & SEO</h1>
            </div>
            <span className="ready-status">
              <span
                className={
                  pipelineStep === 'completed'
                    ? 'bg-emerald-400'
                    : isGenerating
                    ? 'bg-cyan-400 animate-ping'
                    : 'bg-white/40'
                }
              />
              {pipelineStep === 'completed'
                ? 'Vídeo pronto!'
                : isGenerating
                ? 'Renderizando na nuvem'
                : 'Pronto para renderizar'}
            </span>
          </div>

          <div className="output-layout">
            {/* 9:16 Vertical Smartphone Mockup */}
            <div className={`phone-preview ${isGenerating ? 'rendering' : ''}`}>
              <div className="phone-top">
                <span>9:41</span>
                <span>●●●</span>
              </div>

              {isGenerating ? (
                <div className="rendering-state">
                  <div className="spinner" />
                  <strong>{statusMessage || 'Renderizando na nuvem'}</strong>
                  <small>Ollama + Colab T4 em sincronia ({Math.round(progress)}%)</small>
                </div>
              ) : (
                <VideoPlayer
                  videoUrl={videoUrl}
                  title={generatedTitle}
                  narration={generatedDesc}
                  hashtags={generatedTags.split(' ')}
                  onOpenSettings={onOpenSettings}
                />
              )}

              <div className="phone-bottom">
                <span />
                <span />
                <span />
              </div>
            </div>

            {/* Dynamic Copy Fields (Growth Hacker Output) */}
            <div className="copy-fields">
              <CopyField
                label="Título com Gatilho Viral (SEO)"
                value={generatedTitle}
                name="title"
                copied={copiedKey}
                onCopy={copy}
              />

              <CopyField
                label="Descrição de Alta Conversão"
                value={generatedDesc}
                name="description"
                copied={copiedKey}
                onCopy={copy}
              />

              <CopyField
                label="Hashtags Estratégicas do Growth Hacker"
                value={generatedTags}
                name="hashtags"
                copied={copiedKey}
                onCopy={copy}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Stepper */}
      {pipelineStep !== 'idle' && (
        <div className="mt-8">
          <StatusStepper
            currentStep={pipelineStep}
            statusMessage={statusMessage}
            progress={progress}
            errorMessage={errorMessage}
            onRetry={handleGenerate}
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}
    </section>
  )
}

function CopyField({
  label,
  value,
  name,
  copied,
  onCopy,
}: {
  label: string
  value: string
  name: string
  copied: string
  onCopy: (key: string, text: string) => void
}) {
  return (
    <div className="copy-field">
      <div className="field-top">
        <label className="field-label">{label}</label>
        <button className="copy-button" onClick={() => onCopy(name, value)}>
          {copied === name ? <Check className="text-emerald-400" /> : <Clipboard />}
          {copied === name ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="copy-value">{value}</div>
    </div>
  )
}

/* =========================================================================
   5. METRICS & CSV INSIGHTS SECTION
   ========================================================================= */

function MetricsSection({
  initialMetrics,
  initialTips,
}: {
  initialMetrics: MetricCardData[]
  initialTips: PerformanceTip[]
}) {
  const [metrics, setMetrics] = useState<MetricCardData[]>(initialMetrics)
  const [tips, setTips] = useState<PerformanceTip[]>(initialTips)
  const [summary, setSummary] = useState(
    'Diagnóstico do Performance Agent: vídeos com gancho nos primeiros 2.5s aumentam o tempo médio em 42%.'
  )
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisSuccess, setAnalysisSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file.name)
      processCsv(file)
    }
  }

  const processCsv = (file: File) => {
    setIsAnalyzing(true)
    setAnalysisSuccess(false)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      try {
        const result = await analyzeMetricsApi(text)
        setMetrics(result.metrics)
        setTips(result.tips)
        setSummary(result.summary)
        setAnalysisSuccess(true)
      } catch (err) {
        console.error('Error analyzing CSV:', err)
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.onerror = () => {
      setIsAnalyzing(false)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    setSelectedFile('tiktok_analytics_sample_2026.csv')
    setIsAnalyzing(true)
    setTimeout(() => {
      setMetrics([
        {
          id: 'retention',
          label: 'Taxa de Retenção (0-3s)',
          value: '84.2%',
          change: '+18.4%',
          color: 'cyan',
          points: '12,22 36,18 60,12 84,8 108,4',
        },
        {
          id: 'watch_time',
          label: 'Tempo Médio Assistido',
          value: '13.8s',
          change: '+2.1s',
          color: 'pink',
          points: '12,20 36,16 60,14 84,10 108,6',
        },
        {
          id: 'shares',
          label: 'Compartilhamentos',
          value: '3.840',
          change: '+34.5%',
          color: 'purple',
          points: '12,24 36,20 60,14 84,8 108,2',
        },
        {
          id: 'ctr',
          label: 'CTR da Primeira Imagem',
          value: '14.6%',
          change: '+3.9%',
          color: 'cyan',
          points: '12,18 36,16 60,12 84,9 108,5',
        },
      ])
      setTips([
        {
          id: 'tip-sample-1',
          text: 'O gancho nos primeiros 2.5s reteve 84% do público: mantenha contrastes de iluminação neon no segundo 0.',
          category: 'hook',
        },
        {
          id: 'tip-sample-2',
          text: 'Pacing ideal de 15 palavras no miolo (3-12s): a narração FranciscaNeural teve 91% de clareza sem pausas longas.',
          category: 'pacing',
        },
        {
          id: 'tip-sample-3',
          text: 'A chamada para ação no segundo 12 gerou pico de comentários de 3.8K: continue utilizando perguntas abertas.',
          category: 'cta',
        },
      ])
      setSummary(
        'Diagnóstico do Performance Agent: Seu formato atual supera a média do nicho em 38%. Recomenda-se dobrar a frequência neste estilo.'
      )
      setIsAnalyzing(false)
      setAnalysisSuccess(true)
    }, 1200)
  }

  return (
    <section className="content metrics-content">
      <div className="section-heading">
        <div>
          <div className="eyebrow purple">
            <BarChart3 /> PERFORMANCE & RETENTION AGENT
          </div>
          <h1>
            Métricas & Insights <span>de IA</span>
          </h1>
          <p>
            Faça upload do relatório de métricas do TikTok (CSV) ou carregue uma amostra para receber diagnósticos automáticos de gancho e retenção.
          </p>
        </div>
        <button
          className="date-button flex items-center gap-1.5"
          onClick={handleLoadSample}
          disabled={isAnalyzing}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Carregar CSV de Amostra
        </button>
      </div>

      {/* Upload Zone */}
      <label className="upload-zone cursor-pointer" htmlFor="csv-upload">
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="upload-icon">
          {isAnalyzing ? (
            <RefreshCw className="h-6 w-6 animate-spin text-[#00f2fe]" />
          ) : analysisSuccess ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <Upload />
          )}
        </div>
        <div>
          <h2>
            {isAnalyzing
              ? 'Analisando arquivo com IA...'
              : selectedFile
              ? `Arquivo: ${selectedFile}`
              : 'Solte seu CSV de métricas aqui'}
          </h2>
          <p>
            ou <span className="text-[#00f2fe] underline">selecione um arquivo</span> do seu computador
          </p>
          <small>Formato: .CSV do TikTok Analytics · Tamanho máximo: 10MB</small>
        </div>
      </label>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.id}>
            <div className="metric-top">
              <span>{metric.label}</span>
              <span className={`metric-icon ${metric.color}`}>
                <TrendingUp />
              </span>
            </div>
            <div className="metric-value-row">
              <strong>{metric.value}</strong>
              <span className={`metric-change ${metric.color}`}>
                {metric.change}
              </span>
            </div>
            <svg
              className="micro-chart"
              viewBox="0 0 120 28"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={`gradient-${metric.color}`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0"
                    stopColor={
                      metric.color === 'cyan'
                        ? '#00f2fe'
                        : metric.color === 'pink'
                        ? '#fe0979'
                        : '#a855f7'
                    }
                    stopOpacity=".3"
                  />
                  <stop
                    offset="1"
                    stopColor={
                      metric.color === 'cyan'
                        ? '#00f2fe'
                        : metric.color === 'pink'
                        ? '#fe0979'
                        : '#a855f7'
                    }
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d={`M ${metric.points} L 108,28 L 12,28 Z`}
                fill={`url(#gradient-${metric.color})`}
              />
              <polyline
                points={metric.points}
                fill="none"
                stroke={
                  metric.color === 'cyan'
                    ? '#00f2fe'
                    : metric.color === 'pink'
                    ? '#fe0979'
                    : '#a855f7'
                }
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* AI Retention Diagnostic Card */}
      <div className="tips-card">
        <div className="tips-icon">
          <Sparkles />
        </div>
        <div className="tips-copy">
          <div className="eyebrow amber">DIAGNÓSTICO DO AGENTE DE RETENÇÃO</div>
          <h2>{summary}</h2>
          <ul>
            {tips.map((tip) => (
              <li key={tip.id} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="http://localhost:5678"
          target="_blank"
          rel="noreferrer"
          className="tips-action inline-flex items-center gap-1"
        >
          Ver fluxo no n8n <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  )
}

/* =========================================================================
   6. ROOT CREATOR DASHBOARD COMPONENT
   ========================================================================= */

export default function CreatorDashboard() {
  const [tab, setTab] = useState<Tab>('trends')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedPromptIdea, setSelectedPromptIdea] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasColabConfigured, setHasColabConfigured] = useState(false)

  useEffect(() => {
    const config = getStoredConfig()
    setHasColabConfigured(Boolean(config.colabUrl))
  }, [isSettingsOpen])

  const handleSelectTrend = (tag: string, insight: string) => {
    setSelectedPromptIdea(`Tema viral: ${tag} — Foco de retenção: ${insight}`)
    setTab('studio')
  }

  return (
    <div className="dashboard">
      <Sidebar
        tab={tab}
        setTab={setTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        agents={MOCK_AGENTS}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasColabConfigured={hasColabConfigured}
      />
      <main className="main-area">
        <Header
          tab={tab}
          onMenu={() => setMobileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {tab === 'trends' && (
          <TrendsSection onSelectTrend={handleSelectTrend} />
        )}
        {tab === 'studio' && (
          <StudioSection
            initialIdea={selectedPromptIdea}
            styles={VISUAL_STYLES}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
        {tab === 'metrics' && (
          <MetricsSection
            initialMetrics={MOCK_METRICS}
            initialTips={MOCK_TIPS}
          />
        )}
      </main>

      {/* Global Connection Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(config: ConnectionConfig) => {
          setHasColabConfigured(Boolean(config.colabUrl))
        }}
      />
    </div>
  )
}
