'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'

import { Tab, TrendItem, VisualStyle, MetricCardData, PerformanceTip, AgentInfo } from '@/types/studio'
import { MOCK_TRENDS, VISUAL_STYLES, MOCK_METRICS, MOCK_TIPS, MOCK_AGENTS } from '@/mocks/studio-data'

interface SidebarProps {
  tab: Tab
  setTab: (tab: Tab) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  agents: AgentInfo[]
}

function Sidebar({ tab, setTab, mobileOpen, setMobileOpen, agents }: SidebarProps) {
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
            <small>Workspace principal</small>
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
          <div className="agent-status">
            <span className="online-dot" />
            <div>
              <strong>Agentes online</strong>
              <small>{onlineCount} agentes ativos (Ollama + Colab)</small>
            </div>
            <ChevronDown />
          </div>

          <button className="nav-item">
            <Settings />
            <span>Configurações</span>
          </button>

          <button className="nav-item">
            <CircleHelp />
            <span>Central de ajuda</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">OP</div>
            <div>
              <strong>Creator Studio</strong>
              <small>Modo Autônomo</small>
            </div>
            <ChevronDown />
          </div>
        </div>
      </aside>
    </>
  )
}

function Header({ tab, onMenu }: { tab: Tab; onMenu: () => void }) {
  const titles: Record<Tab, [string, string]> = {
    trends: ['Tendências do Dia', 'Descubra os ganchos e estéticas que estão capturando a atenção agora.'],
    studio: ['Estúdio de Criação', 'Transforme uma ideia em um vídeo curto de alta retenção para o TikTok.'],
    metrics: ['Métricas & Insights de IA', 'Analise a retenção de 0-3 segundos e potencialize seu próximo vídeo.'],
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
        <button className="icon-button" aria-label="Buscar tendências">
          <Search />
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

function TrendsSection({
  trends,
  onSelectTrend,
}: {
  trends: TrendItem[]
  onSelectTrend: (tag: string, insight: string) => void
}) {
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
            O Coolhunter Agent analisou dados de engajamento nas últimas 24h para encontrar os ganchos virais com maior potencial de retenção.
          </p>
        </div>
        <button className="date-button">
          Últimas 24 horas <ChevronDown />
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

function StudioSection({
  initialIdea,
  styles,
}: {
  initialIdea: string
  styles: VisualStyle[]
}) {
  const [idea, setIdea] = useState(initialIdea)
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0)
  const [duration, setDuration] = useState<'5s' | '10s' | '15s'>('15s')
  const [voice, setVoice] = useState('pt-BR-FranciscaNeural (Ultra-realista)')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')

  // Update idea if initialIdea changes from trend selection
  React.useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea)
    }
  }, [initialIdea])

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1500)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulated rendering timeout for preview in Branch 1
    setTimeout(() => {
      setIsGenerating(false)
    }, 4000)
  }

  const generatedTitle = "POV: Quando você descobre que IA pode gerar seu vídeo completo em segundos"
  const generatedDesc = "Descubra a tecnologia que está transformando criadores em fenômenos virais. Comente 'QUERO' para ver os bastidores! #TikTok #CreatorEconomy"
  const generatedTags = "#fyp #viral #trending #ia #criatividade #studioops #automacao"

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
            Descreva seu vídeo ou escolha um tema
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
            <button className="text-action">
              <Plus /> Customizar estilo
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
            <Zap />
            {isGenerating ? 'Orquestrando Agentes de IA...' : 'Gerar vídeo para TikTok'}
            <Sparkles />
          </button>

          <p className="generation-note">
            <Gauge /> Geração média: 45–90 segundos (GPU T4 Colab)
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
              <span /> {isGenerating ? 'Renderizando na nuvem' : 'Pronto para renderizar'}
            </span>
          </div>

          <div className="output-layout">
            <div className={`phone-preview ${isGenerating ? 'rendering' : ''}`}>
              <div className="phone-top">
                <span>9:41</span>
                <span>●●●</span>
              </div>

              {isGenerating ? (
                <div className="rendering-state">
                  <div className="spinner" />
                  <strong>Roteirizando & Sintetizando</strong>
                  <small>Ollama estruturando ganchos (0-3s)...</small>
                </div>
              ) : (
                <div className="ready-state">
                  <div className="play-circle">
                    <Play fill="currentColor" />
                  </div>
                  <strong>Pronto para renderizar</strong>
                  <small>O player TikTok aparecerá aqui</small>
                </div>
              )}

              <div className="phone-bottom">
                <span />
                <span />
                <span />
              </div>
            </div>

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
          {copied === name ? <Check /> : <Clipboard />}
          {copied === name ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="copy-value">{value}</div>
    </div>
  )
}

function MetricsSection({
  metrics,
  tips,
}: {
  metrics: MetricCardData[]
  tips: PerformanceTip[]
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name)
    }
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
            Faça upload do relatório de métricas do TikTok (CSV) e receba diagnósticos automáticos de gancho e retenção.
          </p>
        </div>
      </div>

      <label className="upload-zone cursor-pointer" htmlFor="csv-upload">
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="upload-icon">
          <Upload />
        </div>
        <div>
          <h2>{selectedFile ? `Arquivo: ${selectedFile}` : 'Solte seu CSV de métricas aqui'}</h2>
          <p>
            ou <span className="text-[#00f2fe] underline">selecione um arquivo</span> do seu computador
          </p>
          <small>Formato: .CSV do TikTok Analytics · Tamanho máximo: 10MB</small>
        </div>
      </label>

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

      <div className="tips-card">
        <div className="tips-icon">
          <Sparkles />
        </div>
        <div className="tips-copy">
          <div className="eyebrow amber">DIAGNÓSTICO DO AGENTE DE RETENÇÃO</div>
          <h2>Três oportunidades críticas para seu próximo vídeo</h2>
          <ul>
            {tips.map((tip) => (
              <li key={tip.id}>{tip.text}</li>
            ))}
          </ul>
        </div>
        <button className="tips-action">
          Ver análise completa no n8n <span>→</span>
        </button>
      </div>
    </section>
  )
}

export default function CreatorDashboard() {
  const [tab, setTab] = useState<Tab>('trends')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedPromptIdea, setSelectedPromptIdea] = useState('')

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
      />
      <main className="main-area">
        <Header tab={tab} onMenu={() => setMobileOpen(true)} />
        {tab === 'trends' && (
          <TrendsSection
            trends={MOCK_TRENDS}
            onSelectTrend={handleSelectTrend}
          />
        )}
        {tab === 'studio' && (
          <StudioSection
            initialIdea={selectedPromptIdea}
            styles={VISUAL_STYLES}
          />
        )}
        {tab === 'metrics' && (
          <MetricsSection metrics={MOCK_METRICS} tips={MOCK_TIPS} />
        )}
      </main>
    </div>
  )
}
