'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Hash,
  FileText,
  Link2,
  Smartphone,
  Trash2,
  Download,
  Clock,
  PlaySquare,
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
  TikTokVideoInfo,
  SavedVideo,
} from '@/types/studio'
import {
  MOCK_TRENDS,
  VISUAL_STYLES,
  MOCK_METRICS,
  MOCK_TIPS,
  MOCK_AGENTS,
  MOCK_SAVED_VIDEOS,
} from '@/mocks/studio-data'
import {
  fetchTrendsApi,
  generateScriptApi,
  dispatchMediaRenderApi,
  pollJobStatusApi,
  analyzeMetricsApi,
  getStoredConfig,
  getStoredSavedVideos,
  saveStoredSavedVideos,
} from '@/services/api'
import { VideoPlayer } from './video-player'
import { StatusStepper } from './status-stepper'
import { SettingsModal } from './settings-modal'
import { StudioOpsLogo } from './studio-ops-logo'

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
  savedVideosCount?: number
}

function Sidebar({
  tab,
  setTab,
  mobileOpen,
  setMobileOpen,
  agents,
  onOpenSettings,
  hasColabConfigured,
  savedVideosCount,
}: SidebarProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(true)

  const items = [
    { id: 'trends' as Tab, label: 'Tendências do Dia', icon: TrendingUp },
    { id: 'studio' as Tab, label: 'Estúdio de Criação', icon: WandSparkles },
    { id: 'metrics' as Tab, label: 'Métricas & Insights', icon: BarChart3 },
    {
      id: 'saved_videos' as Tab,
      label: 'Vídeos Salvos',
      icon: Film,
      count: savedVideosCount,
    },
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
        <div className="brand" style={{ padding: '0 8px 24px' }}>
          <StudioOpsLogo variant="horizontal" size={32} animated />
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar navegação"
          >
            <X />
          </button>
        </div>

        <div className="workspace-container">
          <button
            type="button"
            className={`workspace ${workspaceOpen ? 'workspace-open' : ''}`}
            onClick={() => setWorkspaceOpen((prev) => !prev)}
            aria-expanded={workspaceOpen}
            aria-controls="workspace-nav"
            title={workspaceOpen ? 'Recolher menu do Workspace' : 'Expandir menu do Workspace'}
          >
            <div className="workspace-avatar" style={{ padding: 0, background: 'none' }}>
              <StudioOpsLogo variant="emblem" size={28} />
            </div>
            <div>
              <strong>StudioOps Core</strong>
              <small>Workspace autônomo</small>
            </div>
            <ChevronDown className="workspace-chevron" />
          </button>

          <div
            id="workspace-nav"
            className={`workspace-collapse ${workspaceOpen ? 'open' : ''}`}
          >
            <div className="workspace-collapse-inner">
              <nav className="nav-list" aria-label="Navegação principal">
                <span className="nav-label">Navegação</span>
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
                      {item.id === 'saved_videos' && typeof item.count === 'number' && item.count > 0 && (
                        <span className="count-badge">{item.count}</span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

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
    saved_videos: [
      'Vídeos Salvos',
      'Gerencie, reproduza, baixe ou exclua os vídeos gerados com IA no seu estúdio.',
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

interface TrendsSectionProps {
  onSelectTrend: (trend: TrendItem) => void
}

function TrendsSection({ onSelectTrend }: TrendsSectionProps) {
  const [trends, setTrends] = useState<TrendItem[]>(MOCK_TRENDS)
  const [loading, setLoading] = useState(false)
  const [providerName, setProviderName] = useState<string>('Coolhunter Agent')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [nicheQuery, setNicheQuery] = useState('')
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null)
  const [selectedTrendModal, setSelectedTrendModal] = useState<TrendItem | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const categories = [
    { id: 'all', label: '🌟 Todas' },
    { id: 'tech', label: '🤖 Tecnologia & IA' },
    { id: 'productivity', label: '⚡ Produtividade' },
    { id: 'lifestyle', label: '✨ Estilo de Vida' },
    { id: 'finance', label: '💰 Finanças' },
    { id: 'food', label: '🍔 Culinária & Fatos' },
  ]

  const loadTrends = async (cat: string = activeCategory, niche?: string) => {
    setLoading(true)
    const result = await fetchTrendsApi(cat, niche)
    setTrends(result.trends)
    setProviderName(result.providerName || (result.source === 'n8n_live' ? 'n8n Orquestrador' : 'Coolhunter Local'))
    setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    setLoading(false)
  }

  useEffect(() => {
    loadTrends('all')
  }, [])

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    setNicheQuery('')
    loadTrends(catId)
  }

  const handleNicheSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nicheQuery.trim()) return
    loadTrends('all', nicheQuery.trim())
  }

  const copyHook = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHookId(id)
    setTimeout(() => setCopiedHookId(null), 2000)
  }

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
            O Coolhunter Agent analisa padrões de engajamento no TikTok e extrai ganchos virais de 0-3s ({providerName}{lastUpdated ? ` • Atualizado às ${lastUpdated}` : ''}).
          </p>
        </div>
        <button
          className="date-button flex items-center gap-1.5"
          onClick={() => loadTrends(activeCategory, nicheQuery || undefined)}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Minerando tendências...' : 'Atualizar tendências'}
        </button>
      </div>

      {/* Category Pills */}
      <div className="trend-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id && !nicheQuery ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Niche exploration input */}
      <form onSubmit={handleNicheSearch} className="niche-search-box">
        <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
        <input
          type="text"
          className="niche-search-input"
          placeholder="Explorar tendências em qualquer nicho com IA (ex: Fitness, Imóveis, Advocacia, Fotografia...)"
          value={nicheQuery}
          onChange={(e) => setNicheQuery(e.target.value)}
        />
        {nicheQuery && (
          <button
            type="button"
            className="text-slate-400 hover:text-white mr-1 text-xs"
            onClick={() => {
              setNicheQuery('')
              loadTrends(activeCategory)
            }}
          >
            Limpar
          </button>
        )}
        <button type="submit" className="niche-search-btn" disabled={loading || !nicheQuery.trim()}>
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? 'Minerando...' : 'Descobrir com IA'}
        </button>
      </form>

      {/* Trends Grid */}
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
                onClick={() => setSelectedTrendModal(trend)}
                aria-label={`Ver raio-x para ${trend.tag}`}
                title="Ver detalhes da tendência"
              >
                •••
              </button>
            </div>

            <div className="trend-card-body">
              <div className="trend-title-row">
                <h2>{trend.tag}</h2>
                <TrendingUp className="trend-arrow" />
              </div>

              {trend.topic && (
                <div className="text-[11px] font-medium text-slate-300 mt-1 line-clamp-1">
                  {trend.topic}
                </div>
              )}

              <p>{trend.insight}</p>

              {/* Hook Box (0-3s) */}
              <div className="trend-hook-container">
                <div className="trend-hook-header">
                  <span className="trend-hook-label">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" /> Gancho Viral (0-3s)
                  </span>
                  <button
                    className="trend-copy-hook-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyHook(trend.id, trend.hookIdea || trend.insight)
                    }}
                    title="Copiar texto do gancho"
                  >
                    {copiedHookId === trend.id ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Copiado!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clipboard className="w-2.5 h-2.5" /> Copiar
                      </span>
                    )}
                  </button>
                </div>
                <p className="trend-hook-text">
                  "{trend.hookIdea || trend.insight}"
                </p>
              </div>

              {/* Meta Chips: Style & Retention Score */}
              <div className="trend-meta-row">
                <span className="style-chip">
                  🎨 {trend.visualStyleRecommended || 'Cyberpunk'}
                </span>
                <span className="retention-chip">
                  ⚡ {trend.retentionScore || 88}% Retenção
                </span>
              </div>

              <button
                className="create-button"
                onClick={() => onSelectTrend(trend)}
              >
                <Sparkles /> Criar vídeo sobre isso
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Modal: Raio-X da Tendência */}
      {selectedTrendModal && (
        <div
          className="trend-modal-overlay"
          onClick={() => setSelectedTrendModal(null)}
        >
          <div
            className="trend-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#242730] flex items-start justify-between bg-[#15171d]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Raio-X de Viralização
                  </span>
                  <span className="text-[10px] text-slate-400">• {selectedTrendModal.category || 'Tendência Geral'}</span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedTrendModal.tag}
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${selectedTrendModal.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-pink-500/20 text-pink-300'}`}>
                    {selectedTrendModal.growth}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedTrendModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Insight */}
              <div>
                <span className="text-slate-400 block font-medium mb-1">Por que está viralizando:</span>
                <div className="p-3 bg-[#181a20] rounded-lg border border-[#2b2e38] text-slate-200 leading-relaxed">
                  {selectedTrendModal.insight}
                </div>
              </div>

              {/* Gancho */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Gancho de 0-3 Segundos (Hook):
                  </span>
                  <button
                    onClick={() => copyHook(selectedTrendModal.id, selectedTrendModal.hookIdea || '')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedHookId === selectedTrendModal.id ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copiado!</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copiar gancho</span>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-800/40 text-cyan-100 font-medium italic">
                  "{selectedTrendModal.hookIdea || 'Gancho calculado pelo Coolhunter'}"
                </div>
              </div>

              {/* Roteiro em 3 Atos Sugerido */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-[#171920] border border-[#262832] rounded-lg text-center">
                  <span className="text-[10px] text-cyan-400 font-bold block mb-1">1. Hook (0-3s)</span>
                  <span className="text-[11px] text-slate-300">Quebra de padrão visual e curiosidade</span>
                </div>
                <div className="p-2.5 bg-[#171920] border border-[#262832] rounded-lg text-center">
                  <span className="text-[10px] text-pink-400 font-bold block mb-1">2. Corpo (3-12s)</span>
                  <span className="text-[11px] text-slate-300">Entrega rápida do valor em 3 imagens SDXL</span>
                </div>
                <div className="p-2.5 bg-[#171920] border border-[#262832] rounded-lg text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-1">3. CTA (12-15s)</span>
                  <span className="text-[11px] text-slate-300">Gatilho de comentário ('Comente TESTAR')</span>
                </div>
              </div>

              {/* Metadados */}
              <div className="flex items-center justify-between p-3 bg-[#171920] rounded-lg border border-[#242730] text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Estilo Recomendado</span>
                  <strong className="text-purple-300">{selectedTrendModal.visualStyleRecommended || 'Cyberpunk'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Retenção Estimada</span>
                  <strong className="text-emerald-400">{selectedTrendModal.retentionScore || 88}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Duração Ideal</span>
                  <strong className="text-white">15 segundos</strong>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#242730] bg-[#14161c] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTrendModal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const item = selectedTrendModal
                  setSelectedTrendModal(null)
                  onSelectTrend(item)
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                Criar vídeo com esta tendência no Estúdio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* =========================================================================
   4. STUDIO SECTION (END-TO-END AUTOMATED PIPELINE)
   ========================================================================= */

function getInitialScriptPreview(rawIdea: string, styleName: string = 'Cinematic'): GeneratedScript {
  const lower = rawIdea.toLowerCase()
  const s = styleName.toLowerCase()

  // 1. Finanças / 50 Reais / Dólar / Investimentos
  if (
    lower.includes('finan') ||
    lower.includes('dolar') ||
    lower.includes('dólar') ||
    lower.includes('reais') ||
    lower.includes('50') ||
    lower.includes('banco') ||
    lower.includes('invest') ||
    lower.includes('dinheiro') ||
    lower.includes('renda')
  ) {
    return {
      topic: 'Investimentos em Dólar e Renda Passiva',
      styleName,
      duration: '15s',
      scenes: [
        {
          order: 1,
          type: 'hook',
          timeRange: '0-3s',
          narrationText: 'Se você tem 50 reais parados no banco, pare de perder dinheiro agora.',
          imagePromptEnglish: `Cinematic macro close-up of real bank notes and coins on a dark wooden table with moody amber studio lighting, digital clock accelerating in background, ${s} style, photorealistic 8k, vertical 9:16 aspect ratio`,
        },
        {
          order: 2,
          type: 'problem',
          timeRange: '3-7s',
          narrationText: 'A inflação real no Brasil devora seu poder de compra em silêncio, enquanto o dólar valorizou mais de 300% na última década.',
          imagePromptEnglish: `Dramatic high contrast visualization of inflation eroding paper currency into glowing red dust while an emerald green dollar index curve surges upward across Wall Street skyscrapers, ${s} style, volumetric lighting, vertical 9:16`,
        },
        {
          order: 3,
          type: 'solution',
          timeRange: '7-11s',
          narrationText: 'Com menos de 10 dólares você compra frações dos maiores ativos globais e começa a receber dividendos direto na sua conta.',
          imagePromptEnglish: `Sleek modern smartphone held by an investor displaying an investment portfolio receiving incoming dollar dividend payments with glowing gold particles, ${s} style, depth of field, vertical 9:16`,
        },
        {
          order: 4,
          type: 'cta',
          timeRange: '11-15s',
          narrationText: 'Qual foi o primeiro investimento que você fez na vida? Comente aqui embaixo que eu respondo todos!',
          imagePromptEnglish: `Prestigious modern vault door opening to reveal gleaming gold bars and global currency signs illuminated by atmospheric cinematic light flares, ${s} style, vertical 9:16`,
        },
      ],
      fullNarration:
        'Se você tem 50 reais parados no banco, pare de perder dinheiro agora. A inflação real no Brasil devora seu poder de compra em silêncio, enquanto o dólar valorizou mais de 300% na última década. Com menos de 10 dólares você compra frações dos maiores ativos globais e começa a receber dividendos direto na sua conta. Qual foi o primeiro investimento que você fez na vida? Comente aqui embaixo que eu respondo todos!',
    }
  }

  // 2. Canadá / Viagens
  if (lower.includes('canada') || lower.includes('canadá') || lower.includes('viagem') || lower.includes('travel')) {
    return {
      topic: 'A vida real no Canadá',
      styleName,
      duration: '15s',
      scenes: [
        {
          order: 1,
          type: 'hook',
          timeRange: '0-3s',
          narrationText: 'Três segredos sobre a vida no Canadá que ninguém te conta.',
          imagePromptEnglish: `Breathtaking high quality vertical shot of picturesque snow-covered streets in Quebec Canada at twilight, glowing lanterns, cozy snowfall, ${s} style, cinematic 8k, vertical 9:16 aspect ratio`,
        },
        {
          order: 2,
          type: 'problem',
          timeRange: '3-7s',
          narrationText: 'O inverno a menos trinta e cinco graus congela seus cílios em dois minutos e transforma sair de casa em uma expedição polar.',
          imagePromptEnglish: `Extreme macro close-up of winter traveler face with frozen frosted eyelashes and warm wool scarf under sub-zero blizzard, ${s} style, vertical 9:16`,
        },
        {
          order: 3,
          type: 'solution',
          timeRange: '7-11s',
          narrationText: 'Em compensação, o poder de compra com salário mínimo e a vista surreal dos lagos de Banff fazem tudo valer a pena.',
          imagePromptEnglish: `Stunning vertical landscape of Lake Louise Banff Canada, emerald glacial turquoise water surrounded by towering snow-capped Rocky Mountains, ${s} style, 8k photography, vertical 9:16 aspect ratio`,
        },
        {
          order: 4,
          type: 'cta',
          timeRange: '11-15s',
          narrationText: 'Você teria coragem de encarar esse inverno congelante? Deixe sua resposta nos comentários!',
          imagePromptEnglish: `Cozy Canadian wooden mountain cabin under glowing green Northern Lights aurora borealis in starry night sky, ${s} style, vertical 9:16`,
        },
      ],
      fullNarration:
        'Três segredos sobre a vida no Canadá que ninguém te conta. O inverno a menos trinta e cinco graus congela seus cílios em dois minutos e transforma sair de casa em uma expedição polar. Em compensação, o poder de compra com salário mínimo e a vista surreal dos lagos de Banff fazem tudo valer a pena. Você teria coragem de encarar esse inverno congelante? Deixe sua resposta nos comentários!',
    }
  }

  // 3. Soccer / Futebol
  if (lower.includes('socc') || lower.includes('futebol') || lower.includes('gol')) {
    return {
      topic: 'O chute que desafiou as leis da física no futebol',
      styleName,
      duration: '15s',
      scenes: [
        {
          order: 1,
          type: 'hook',
          timeRange: '0-3s',
          narrationText: 'O chute que desafiou as leis da física e chocou o mundo inteiro.',
          imagePromptEnglish: `Dramatic high-speed macro action close-up of soccer boot striking glowing soccer ball with immense kinetic power, flying grass particles, stadium floodlights, ${s} style, 8k, photorealistic vertical 9:16 aspect ratio`,
        },
        {
          order: 2,
          type: 'problem',
          timeRange: '3-7s',
          narrationText: 'Goleiros de elite admitem que chutes com efeito Magnus externo são impossíveis de calcular em frações de segundo.',
          imagePromptEnglish: `Spectacular wide view behind the goal showing ball curving in an impossible aerodynamic trajectory past the goalkeeper hands, ${s} style, vertical 9:16`,
        },
        {
          order: 3,
          type: 'solution',
          timeRange: '7-11s',
          narrationText: 'A rotação milimétrica a mais de 115 km/h faz a bola contornar a barreira e mergulhar direto no ângulo morto.',
          imagePromptEnglish: `Cinematic 3D scientific vector overlay visualizing airflow aerodynamic turbulence around rotating soccer ball, ${s} style, vertical 9:16`,
        },
        {
          order: 4,
          type: 'cta',
          timeRange: '11-15s',
          narrationText: 'Qual foi o gol de falta mais inacreditável da história? Deixe seu voto nos comentários!',
          imagePromptEnglish: `Glorious golden champion trophy under dramatic atmospheric stadium lens flare with falling confetti, ${s} style, vertical 9:16`,
        },
      ],
      fullNarration:
        'O chute que desafiou as leis da física e chocou o mundo inteiro. Goleiros de elite admitem que chutes com efeito Magnus externo são impossíveis de calcular em frações de segundo. A rotação milimétrica a mais de 115 km/h faz a bola contornar a barreira e mergulhar direto no ângulo morto. Qual foi o gol de falta mais inacreditável da história? Deixe seu voto nos comentários!',
    }
  }

  // 4. Padrão Adaptativo com 4 Cenas Dinâmicas
  const topicLabel = rawIdea ? rawIdea.slice(0, 45) : 'Como a inteligência artificial cria vídeos em segundos'
  return {
    topic: topicLabel,
    styleName,
    duration: '15s',
    scenes: [
      {
        order: 1,
        type: 'hook',
        timeRange: '0-3s',
        narrationText: `Você sabia que quase tudo que te contaram sobre ${topicLabel} tem um lado oculto?`,
        imagePromptEnglish: `High-impact striking opening visual capturing ${topicLabel}, dramatic atmospheric composition, cinematic lighting, ${s} style, 8k render, vertical 9:16 aspect ratio`,
      },
      {
        order: 2,
        type: 'problem',
        timeRange: '3-7s',
        narrationText: 'A maioria comete o erro clássico de tentar o caminho tradicional sem entender a mecânica real do assunto.',
        imagePromptEnglish: `Intense visual revealing the core challenge behind ${topicLabel}, dark moody contrast, ${s} style, vertical 9:16`,
      },
      {
        order: 3,
        type: 'solution',
        timeRange: '7-11s',
        narrationText: 'Quando você inverte a lógica e prioriza o fundamento prático, o resultado aparece três vezes mais rápido.',
        imagePromptEnglish: `Dynamic breakthrough scene revealing the practical solution for ${topicLabel}, rich vibrant lighting, ${s} aesthetic, vertical 9:16 aspect ratio`,
      },
      {
        order: 4,
        type: 'cta',
        timeRange: '11-15s',
        narrationText: 'Qual a sua opinião sobre isso? Comente aqui embaixo que eu quero saber!',
        imagePromptEnglish: `Inspiring conclusion scene highlighting the impact of ${topicLabel}, cinematic lens flare and warm glow, ${s} style, vertical 9:16`,
      },
    ],
    fullNarration: `Você sabia que quase tudo que te contaram sobre ${topicLabel} tem um lado oculto? A maioria comete o erro clássico de tentar o caminho tradicional sem entender a mecânica real do assunto. Quando você inverte a lógica e prioriza o fundamento prático, o resultado aparece três vezes mais rápido. Qual a sua opinião sobre isso? Comente aqui embaixo que eu quero saber!`,
  }
}

function StudioSection({
  initialIdea,
  initialStyleName,
  styles,
  onOpenSettings,
  onSaveVideo,
}: {
  initialIdea: string
  initialStyleName?: string
  styles: VisualStyle[]
  onOpenSettings: () => void
  onSaveVideo?: (video: SavedVideo) => void
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

  // Active Output Tab: 'seo' (Metadata) or 'script' (4-Scene Detailed Teleprompter)
  const [activeOutputTab, setActiveOutputTab] = useState<'seo' | 'script'>('seo')

  // Initial contextual content based on the initial idea
  const initialPreview = getInitialScriptPreview(initialIdea || '', styles[0]?.name || 'Cinematic')
  const [currentScript, setCurrentScript] = useState<GeneratedScript | null>(initialPreview)

  // Generated Outputs
  const [generatedTitle, setGeneratedTitle] = useState(() => {
    if (initialIdea && (initialIdea.includes('50') || initialIdea.includes('dolar') || initialIdea.includes('invest'))) {
      return 'O segredo de quem faz 50 reais renderem em dólar'
    }
    return 'POV: Quando você descobre como viralizar no TikTok com roteiros densos'
  })
  const [generatedDesc, setGeneratedDesc] = useState(() => {
    if (initialIdea && (initialIdea.includes('50') || initialIdea.includes('dolar') || initialIdea.includes('invest'))) {
      return 'Pare de deixar dinheiro parado na poupança perdendo para a inflação! Conheça a estratégia de dolarização com aportes pequenos. Comente se você já investe! #financas #dolar #investimentos'
    }
    return "Descubra a estrutura de 4 cenas que retém a audiência até o último segundo. Comente 'QUERO' para acessar o framework! #Growth #TikTok"
  })
  const [generatedTags, setGeneratedTags] = useState(() => {
    if (initialIdea && (initialIdea.includes('50') || initialIdea.includes('dolar') || initialIdea.includes('invest'))) {
      return '#financas #investimentos #dolar #rendapassiva #dinheiro #educacaofinanceira #viral'
    }
    return '#fyp #viral #trending #estrategia #conteudo #crescimento #criatividade'
  })
  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [copiedKey, setCopiedKey] = useState('')
  const [isSavedLocally, setIsSavedLocally] = useState(false)
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea)
      const preview = getInitialScriptPreview(initialIdea, styles[selectedStyleIndex]?.name || 'Cinematic')
      setCurrentScript(preview)

      const isFin =
        initialIdea.toLowerCase().includes('dolar') ||
        initialIdea.toLowerCase().includes('dólar') ||
        initialIdea.toLowerCase().includes('reais') ||
        initialIdea.toLowerCase().includes('50') ||
        initialIdea.toLowerCase().includes('banco') ||
        initialIdea.toLowerCase().includes('invest') ||
        initialIdea.toLowerCase().includes('dinheiro')

      if (isFin) {
        setGeneratedTitle('O segredo de quem faz 50 reais renderem em dólar')
        setGeneratedDesc(
          'Pare de deixar dinheiro parado na poupança perdendo para a inflação! Conheça a estratégia de dolarização com aportes pequenos. Comente se você já investe! #financas #dolar #investimentos'
        )
        setGeneratedTags('#financas #investimentos #dolar #rendapassiva #dinheiro #educacaofinanceira #viral')
      } else if (initialIdea.toLowerCase().includes('canada') || initialIdea.toLowerCase().includes('canadá')) {
        setGeneratedTitle('A vida real no Canadá que ninguém te mostra')
        setGeneratedDesc(
          'Você teria coragem de encarar -35°C? Conheça as paisagens mais surreais e o choque cultural de morar no Canadá. Comente se você moraria lá! #canada #viagem #intercambio'
        )
        setGeneratedTags('#canada #viagem #intercambio #morarfora #inverno #curiosidades #viral')
      } else if (initialIdea.toLowerCase().includes('socc') || initialIdea.toLowerCase().includes('futebol')) {
        setGeneratedTitle('O chute que desafiou as leis da física no futebol')
        setGeneratedDesc(
          'Você lembra dessa falta lendária? A curva aerodinâmica que cientistas tentam explicar até hoje. Comente seu gol favorito! #futebol #soccer'
        )
        setGeneratedTags('#futebol #soccer #gols #championsleague #skills #esporte #viral')
      }
    }
  }, [initialIdea, styles, selectedStyleIndex])

  useEffect(() => {
    if (initialStyleName) {
      const idx = styles.findIndex(
        (s) =>
          s.name.toLowerCase().includes(initialStyleName.toLowerCase()) ||
          initialStyleName.toLowerCase().includes(s.name.toLowerCase())
      )
      if (idx !== -1) {
        setSelectedStyleIndex(idx)
      }
    }
  }, [initialStyleName, styles])

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
      if (scriptResult.script) {
        setCurrentScript(scriptResult.script)
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

      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current)
      }

      if (dispatchResult.source === 'colab_live' && dispatchResult.jobId) {
        // Step 3: Poll Colab Job until Finished with sequential setTimeout (prevents multiple duplicate triggers)
        setPipelineStep('rendering_video')
        setStatusMessage('Renderizando MP4 com MoviePy e efeitos de zoom contínuo...')
        setProgress(75)

        const jobId = dispatchResult.jobId
        let attempts = 0
        const maxAttempts = 80 // 280 seconds max
        let isDone = false
        let hasSavedVideo = false

        const pollStatus = async () => {
          if (isDone) return
          attempts++
          try {
            const statusRes = await pollJobStatusApi(jobId, config.colabUrl)
            if (isDone) return

            if (statusRes.status === 'completed' && statusRes.videoUrl) {
              isDone = true
              setProgress(100)
              setVideoUrl(statusRes.videoUrl)
              setPipelineStep('completed')
              setStatusMessage('🎉 Vídeo vertical 9:16 renderizado com sucesso!')
              setIsSavedLocally(true)

              if (!hasSavedVideo) {
                hasSavedVideo = true
                onSaveVideo?.({
                  id: `vid-${jobId}`,
                  title: generatedTitle,
                  description: generatedDesc,
                  hashtags: generatedTags.split(' ').filter(Boolean),
                  videoUrl: statusRes.videoUrl,
                  thumbnailUrl: styles[selectedStyleIndex]?.promptKeywords.includes('cyberpunk')
                    ? 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85'
                    : 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=85',
                  styleName: styles[selectedStyleIndex]?.name || 'Cyberpunk',
                  duration,
                  voice: voice.split(' ')[0],
                  createdAt: 'Agora mesmo',
                  retentionScore: 92,
                })
              }
              return
            } else if (statusRes.status === 'error') {
              isDone = true
              setPipelineStep('error')
              setErrorMessage(statusRes.error || 'Erro durante a renderização no Colab.')
              return
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
            isDone = true
            setPipelineStep('error')
            setErrorMessage(
              'Tempo limite de renderização atingido. Verifique se o Colab está ativo e com o Ngrok conectado.'
            )
            return
          }

          if (!isDone) {
            pollingTimerRef.current = setTimeout(pollStatus, 3500)
          }
        }

        pollingTimerRef.current = setTimeout(pollStatus, 2000)
      } else {
        // Fallback simulation: local preview video (executes exactly once)
        const simJobId = dispatchResult.jobId || `sim-${Date.now()}`
        let hasSavedSim = false

        pollingTimerRef.current = setTimeout(() => {
          setPipelineStep('rendering_video')
          setStatusMessage('Finalizando mixagem de áudio e vídeo...')
          setProgress(90)

          pollingTimerRef.current = setTimeout(() => {
            setProgress(100)
            setPipelineStep('completed')
            setStatusMessage('Vídeo demonstrativo gerado com sucesso!')
            const sampleUrl =
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            setVideoUrl(sampleUrl)
            setIsSavedLocally(true)

            if (!hasSavedSim) {
              hasSavedSim = true
              onSaveVideo?.({
                id: `vid-${simJobId}`,
                title: generatedTitle,
                description: generatedDesc,
                hashtags: generatedTags.split(' ').filter(Boolean),
                videoUrl: sampleUrl,
                thumbnailUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
                styleName: styles[selectedStyleIndex]?.name || 'Cyberpunk',
                duration,
                voice: voice.split(' ')[0],
                createdAt: 'Agora mesmo',
                retentionScore: 90,
              })
            }
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
            {isGenerating ? (
              <div className="phone-preview rendering">
                <div className="phone-top">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>
                <div className="rendering-state">
                  <div className="spinner" />
                  <strong>{statusMessage || 'Renderizando na nuvem'}</strong>
                  <small>Ollama + Colab T4 em sincronia ({Math.round(progress)}%)</small>
                </div>
                <div className="phone-bottom">
                  <span />
                </div>
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

            {/* Dynamic Copy Fields & Script Teleprompter */}
            <div className="copy-fields">
              {/* Tab Selector between SEO & Script */}
              <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-neutral-900/90 border border-white/10">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    activeOutputTab === 'seo'
                      ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => setActiveOutputTab('seo')}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Metadados & SEO
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    activeOutputTab === 'script'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => setActiveOutputTab('script')}
                >
                  <Film className="w-3.5 h-3.5" /> Roteiro ({currentScript?.scenes?.length || 4} Cenas)
                </button>
              </div>

              {activeOutputTab === 'seo' ? (
                <>
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
                </>
              ) : (
                <div className="script-teleprompter-box flex flex-col gap-3">
                  {/* Top Narration Card (Teleprompter) */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 to-neutral-900 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-purple-400" /> Narração Contínua ({duration} • {currentScript?.fullNarration?.split(' ').length || 45} palavras)
                      </span>
                      <button
                        type="button"
                        onClick={() => copy('fullNarration', currentScript?.fullNarration || '')}
                        className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-white bg-purple-500/20 px-2 py-0.5 rounded transition"
                        title="Copiar texto para ler como teleprompter"
                      >
                        {copiedKey === 'fullNarration' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copiado!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clipboard className="w-3 h-3" /> Copiar Narração
                          </span>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      "{currentScript?.fullNarration}"
                    </p>
                    <div className="mt-2 text-[10px] text-purple-400/80 flex items-center gap-1">
                      <span>⚡ Ritmo calculado: ~3.0 palavras/segundo (Padrão de Alta Retenção TikTok)</span>
                    </div>
                  </div>

                  {/* Scene-by-Scene Cards */}
                  <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                    {currentScript?.scenes.map((scene) => (
                      <div
                        key={scene.order}
                        className="p-3 rounded-lg bg-neutral-900/80 border border-white/10 hover:border-white/20 transition flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                              Cena {scene.order}
                            </span>
                            <span className="text-[10px] font-semibold text-cyan-400">
                              ⏱️ {scene.timeRange}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 capitalize">
                              • {scene.type === 'hook' ? 'Gancho Viral' : scene.type === 'problem' ? 'Problema / Dado' : scene.type === 'solution' ? 'Solução Prática' : scene.type === 'cta' ? 'Chamada de Ação' : 'Miolo'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copy(`prompt-${scene.order}`, scene.imagePromptEnglish)}
                            className="text-[10px] text-slate-400 hover:text-cyan-300 transition flex items-center gap-1"
                            title="Copiar prompt SDXL desta cena"
                          >
                            {copiedKey === `prompt-${scene.order}` ? (
                              <span className="text-emerald-400">Copiado!</span>
                            ) : (
                              <span>Copiar Prompt</span>
                            )}
                          </button>
                        </div>

                        {/* Narration */}
                        <p className="text-xs text-white font-medium">
                          "{scene.narrationText}"
                        </p>

                        {/* Visual Prompt for SDXL */}
                        <div className="p-2 rounded bg-black/40 border border-white/5 text-[10px] text-slate-400 line-clamp-2">
                          <span className="text-[#00f2fe]/80 font-mono font-semibold">Prompt IA: </span>
                          {scene.imagePromptEnglish}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videoUrl && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-medium">Vídeo salvo na Biblioteca</span>
                  </div>
                  <button
                    type="button"
                    className="saved-action-btn primary text-xs py-1 px-3"
                    onClick={() => {
                      onSaveVideo?.({
                        id: `vid-${Date.now()}`,
                        title: generatedTitle,
                        description: generatedDesc,
                        hashtags: generatedTags.split(' ').filter(Boolean),
                        videoUrl: videoUrl,
                        thumbnailUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
                        styleName: styles[selectedStyleIndex]?.name || 'Cyberpunk',
                        duration,
                        voice: voice.split(' ')[0],
                        createdAt: 'Agora mesmo',
                        retentionScore: 92,
                      })
                      setIsSavedLocally(true)
                    }}
                  >
                    <Film className="h-3.5 w-3.5" /> Salvar Novamente
                  </button>
                </div>
              )}
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
  const isCopied = copied === name
  const isHashtags = name === 'hashtags'
  const tags = isHashtags ? value.split(/\s+/).filter(Boolean) : []

  return (
    <div className="group rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur-sm transition-all hover:border-[#00f2fe]/40 hover:bg-neutral-900 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#00f2fe]/10 text-[#00f2fe]">
            {isHashtags ? <Hash className="h-3 w-3" /> : name === 'title' ? <Sparkles className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
          </span>
          <span className="text-xs font-bold text-white truncate">{label}</span>
        </div>

        <button
          onClick={() => onCopy(name, value)}
          className={`flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
            isCopied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/15 hover:text-white active:scale-95'
          }`}
        >
          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5 text-[#00f2fe]" />}
          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>

      {isHashtags ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onCopy(`tag_${idx}`, tag)}
              title="Clique para copiar esta hashtag"
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                copied === `tag_${idx}`
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/5 text-[#00f2fe] border border-white/10 hover:bg-[#00f2fe]/10'
              }`}
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/85 leading-relaxed break-words select-all">
          {value}
        </p>
      )}

      {/* Character count & tip footer */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-1.5">
        <span>{name === 'title' ? 'Ideal para SEO TikTok' : name === 'description' ? 'Gatilho de Conversão' : 'Tags de Alto Tráfego'}</span>
        <span className="font-mono">{value.length} caracteres</span>
      </div>
    </div>
  )
}

/* =========================================================================
   5. METRICS & CSV INSIGHTS SECTION
   ========================================================================= */

function MetricsSection({
  initialMetrics,
  initialTips,
  savedVideos,
  onDeleteVideo,
  onClearAllVideos,
  onGoToStudio,
}: {
  initialMetrics: MetricCardData[]
  initialTips: PerformanceTip[]
  savedVideos?: SavedVideo[]
  onDeleteVideo?: (id: string) => void
  onClearAllVideos?: () => void
  onGoToStudio?: () => void
}) {
  const [metrics, setMetrics] = useState<MetricCardData[]>(initialMetrics)
  const [tips, setTips] = useState<PerformanceTip[]>(initialTips)
  const [summary, setSummary] = useState(
    'Diagnóstico do Performance Agent: vídeos com gancho nos primeiros 2.5s aumentam o tempo médio em 42%.'
  )
  const [mode, setMode] = useState<'app' | 'csv'>('app')
  const [tiktokUrl, setTiktokUrl] = useState('https://www.tiktok.com/@tiktok/video/7106594312292453678')
  const [detectedVideo, setDetectedVideo] = useState<TikTokVideoInfo | null>({
    title: 'Gancho Provocativo: Como a IA acelera a retenção no TikTok',
    author: 'tiktok',
    authorUrl: 'https://www.tiktok.com/@tiktok',
    videoUrl: 'https://www.tiktok.com/@tiktok/video/7106594312292453678',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=85',
  })
  const [analysisSource, setAnalysisSource] = useState<string | null>('tiktok_app_live')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisSuccess, setAnalysisSuccess] = useState(false)

  const handleFetchApp = async (customUrl?: string) => {
    const urlTarget = (customUrl || tiktokUrl).trim()
    if (!urlTarget) return
    if (customUrl) setTiktokUrl(customUrl)

    setIsAnalyzing(true)
    setAnalysisSuccess(false)
    try {
      const result = await analyzeMetricsApi({ url: urlTarget })
      setMetrics(result.metrics)
      setTips(result.tips)
      setSummary(result.summary)
      if (result.videoInfo) {
        setDetectedVideo(result.videoInfo)
      }
      setAnalysisSource(result.source || 'tiktok_app')
      setAnalysisSuccess(true)
    } catch (err) {
      console.error('Error fetching TikTok metrics:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

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
        const result = await analyzeMetricsApi({ csv: text })
        setMetrics(result.metrics)
        setTips(result.tips)
        setSummary(result.summary)
        setAnalysisSource(result.source || 'csv_parsed')
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
      setAnalysisSource('sample_calibrated')
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
            Puxe os dados de qualquer vídeo ou perfil do TikTok ou importe um relatório CSV para receber diagnósticos automáticos de gancho e retenção.
          </p>
        </div>
        {mode === 'csv' && (
          <button
            className="date-button flex items-center gap-1.5"
            onClick={handleLoadSample}
            disabled={isAnalyzing}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Carregar CSV de Amostra
          </button>
        )}
      </div>

      {/* Tabs Selector: Puxar do App vs Upload CSV */}
      <div className="metrics-tabs">
        <button
          className={`metrics-tab-btn ${mode === 'app' ? 'active' : ''}`}
          onClick={() => setMode('app')}
        >
          <Link2 className="h-4 w-4" />
          Puxar do App TikTok (Link ou @Perfil)
        </button>
        <button
          className={`metrics-tab-btn ${mode === 'csv' ? 'active' : ''}`}
          onClick={() => setMode('csv')}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Upload de CSV (TikTok Analytics)
        </button>
      </div>

      {/* MODO 1: PUXAR DIRETO DO APP */}
      {mode === 'app' && (
        <div className="app-fetch-box">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#00f2fe]" /> Sincronizar com Vídeo ou Perfil do TikTok
              </h2>
              <p className="text-xs text-[#8c909d] mt-1">
                Insira o link de qualquer vídeo ou @perfil público para que o Performance Agent analise os ganchos de retenção e ritmo.
              </p>
            </div>
          </div>

          <form
            className="app-fetch-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleFetchApp()
            }}
          >
            <div className="app-fetch-input-wrapper">
              <Link2 />
              <input
                type="text"
                className="app-fetch-input"
                placeholder="Ex: https://www.tiktok.com/@tiktok/video/... ou @perfil"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <button
              type="submit"
              className="app-fetch-btn"
              disabled={isAnalyzing || !tiktokUrl.trim()}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Analisando Vídeo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Puxar Métricas do App
                </>
              )}
            </button>
          </form>

          <div className="quick-samples">
            <span className="quick-samples-label">Exemplos rápidos:</span>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleFetchApp('https://www.tiktok.com/@studioops/video/7391204859123847291')}
            >
              🔥 Vídeo Viral de IA (Gancho 2.5s)
            </button>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleFetchApp('https://www.tiktok.com/@editoresbrasil/video/7281948301928392102')}
            >
              ⚡ Tutorial Tech Rápido
            </button>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleFetchApp('@tiktok')}
            >
              🎯 Perfil Oficial @tiktok
            </button>
          </div>

          {detectedVideo && (
            <div className="detected-video-banner">
              <div className="detected-video-thumb">
                {detectedVideo.thumbnailUrl ? (
                  <img src={detectedVideo.thumbnailUrl} alt={detectedVideo.title} />
                ) : (
                  <Film className="h-6 w-6 text-[#00f2fe]" />
                )}
              </div>
              <div className="detected-video-info">
                <div className="detected-badge">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Sincronizado com Sucesso</span>
                  {analysisSource && <span className="source-tag">({analysisSource})</span>}
                </div>
                <h3 className="detected-video-title">{detectedVideo.title}</h3>
                <p className="detected-video-author">Criador: <strong>@{detectedVideo.author}</strong></p>
              </div>
              {detectedVideo.videoUrl && (
                <a
                  href={detectedVideo.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="detected-link-btn"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir no TikTok
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODO 2: UPLOAD DE CSV */}
      {mode === 'csv' && (
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
      )}

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

      {/* Seção de Vídeos Salvos (Exibida diretamente abaixo de Métricas & Insights) */}
      {savedVideos && onDeleteVideo && (
        <div className="metrics-saved-videos-wrapper">
          <div className="section-divider" />
          <SavedVideosSection
            videos={savedVideos}
            onDeleteVideo={onDeleteVideo}
            onClearAll={onClearAllVideos}
            onGoToStudio={onGoToStudio}
            isEmbedded={true}
          />
        </div>
      )}
    </section>
  )
}

/* =========================================================================
   6. SAVED VIDEOS COMPONENT
   ========================================================================= */

function SavedVideosSection({
  videos,
  onDeleteVideo,
  onClearAll,
  onGoToStudio,
  isEmbedded = false,
}: {
  videos: SavedVideo[]
  onDeleteVideo: (id: string) => void
  onClearAll?: () => void
  onGoToStudio?: () => void
  isEmbedded?: boolean
}) {
  const [watchingVideo, setWatchingVideo] = useState<SavedVideo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCopy = (video: SavedVideo) => {
    const text = `${video.title}\n\n${video.description || ''}\n\n${video.hashtags ? video.hashtags.join(' ') : ''}`
    navigator.clipboard.writeText(text)
    setCopiedId(video.id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setTimeout(() => {
      onDeleteVideo(id)
      setDeletingId(null)
    }, 200)
  }

  return (
    <section className={`content saved-videos-content ${isEmbedded ? 'px-0 pt-0' : ''}`}>
      <div className="section-heading">
        <div>
          <div className="eyebrow cyan">
            <Film /> {isEmbedded ? 'HISTÓRICO DE PRODUÇÃO' : 'GERENCIADOR DE PRODUÇÃO'}
          </div>
          <h1>
            Vídeos <span>Salvos</span>
          </h1>
          <p>
            {isEmbedded
              ? 'Vídeos gerados salvos automaticamente. Você pode assistir, baixar ou apagar qualquer item da sua biblioteca.'
              : 'Gerencie todos os vídeos criados pelo StudioOps: reproduza, faça download do arquivo final ou exclua vídeos obsoletos.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onGoToStudio && (
            <button
              type="button"
              className="date-button flex items-center gap-1.5"
              onClick={onGoToStudio}
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Criar Novo Vídeo
            </button>
          )}
          {videos.length > 0 && onClearAll && (
            <button
              type="button"
              className="saved-action-btn delete flex items-center gap-1.5 text-xs"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todos os vídeos salvos?')) {
                  onClearAll()
                }
              }}
              title="Apagar todos os vídeos"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar Todos ({videos.length})
            </button>
          )}
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="empty-saved-box">
          <div className="empty-saved-icon">
            <Film className="h-7 w-7" />
          </div>
          <h3>Nenhum vídeo salvo no momento</h3>
          <p>
            Todos os vídeos que você renderizar no Estúdio de Criação ficarão salvos aqui automaticamente para você assistir, baixar ou excluir a qualquer momento.
          </p>
          {onGoToStudio && (
            <button type="button" className="empty-create-btn" onClick={onGoToStudio}>
              <WandSparkles className="h-4 w-4" /> Ir para o Estúdio de Criação
            </button>
          )}
        </div>
      ) : (
        <div className="saved-videos-grid">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className={`saved-video-card ${deletingId === vid.id ? 'opacity-40 transition-opacity' : ''}`}
            >
              {/* Thumbnail Container with Play Overlay */}
              <div
                className="saved-video-thumb-container"
                onClick={() => setWatchingVideo(vid)}
              >
                <img
                  src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85'}
                  alt={vid.title}
                  className="saved-video-thumb-img"
                />
                <div className="saved-video-play-overlay">
                  <div className="play-btn-circle">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="thumb-top-badges">
                  <span className="thumb-badge duration">{vid.duration || '15s'}</span>
                  {vid.retentionScore && (
                    <span className="thumb-badge retention">
                      {vid.retentionScore}% Retenção
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="saved-video-body">
                <h3 className="saved-video-title" title={vid.title}>
                  {vid.title}
                </h3>
                {vid.description && (
                  <p className="saved-video-desc">{vid.description}</p>
                )}

                <div className="saved-video-meta">
                  <span className="saved-video-meta-item">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    {vid.createdAt}
                  </span>
                  <span className="saved-video-meta-item">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                    {vid.styleName}
                  </span>
                </div>

                {vid.hashtags && vid.hashtags.length > 0 && (
                  <div className="saved-video-tags">
                    {vid.hashtags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="saved-video-tag">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="saved-video-actions">
                  <button
                    type="button"
                    className="saved-action-btn primary"
                    onClick={() => setWatchingVideo(vid)}
                    title="Assistir vídeo"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Assistir
                  </button>

                  <a
                    href={vid.videoUrl}
                    download={`studioops-${vid.id}.mp4`}
                    target="_blank"
                    rel="noreferrer"
                    className="saved-action-btn secondary"
                    title="Baixar arquivo de vídeo MP4"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    className="saved-action-btn secondary"
                    onClick={() => handleCopy(vid)}
                    title="Copiar título e hashtags para postar"
                  >
                    {copiedId === vid.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Clipboard className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="saved-action-btn delete"
                    onClick={() => handleDelete(vid.id)}
                    title="Apagar vídeo da biblioteca"
                    aria-label="Apagar vídeo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {watchingVideo && (
        <div className="video-modal-overlay" onClick={() => setWatchingVideo(null)}>
          <div
            className="video-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setWatchingVideo(null)}
              aria-label="Fechar vídeo"
            >
              <X className="h-4 w-4" />
            </button>
            <VideoPlayer
              videoUrl={watchingVideo.videoUrl}
              title={watchingVideo.title}
              narration={watchingVideo.description}
              hashtags={watchingVideo.hashtags}
              onDownload={() => {
                const a = document.createElement('a')
                a.href = watchingVideo.videoUrl
                a.download = `studioops-${watchingVideo.id}.mp4`
                a.click()
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

/* =========================================================================
   7. ROOT CREATOR DASHBOARD COMPONENT
   ========================================================================= */

export default function CreatorDashboard() {
  const [tab, setTab] = useState<Tab>('trends')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedPromptIdea, setSelectedPromptIdea] = useState('')
  const [selectedStyleName, setSelectedStyleName] = useState<string | undefined>()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasColabConfigured, setHasColabConfigured] = useState(false)
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])

  useEffect(() => {
    const raw = getStoredSavedVideos()
    // Auto-deduplicate any duplicates that might have been saved in localStorage
    const seen = new Set<string>()
    const unique: SavedVideo[] = []
    for (const v of raw) {
      const key = `${v.videoUrl || ''}___${v.title?.trim() || ''}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(v)
      }
    }
    setSavedVideos(unique)
    saveStoredSavedVideos(unique)
  }, [])

  useEffect(() => {
    const config = getStoredConfig()
    setHasColabConfigured(Boolean(config.colabUrl))
  }, [isSettingsOpen])

  const handleSaveVideo = (video: SavedVideo) => {
    setSavedVideos((prev) => {
      // Find if this video already exists by ID, or by identical videoUrl + title
      const existsIndex = prev.findIndex(
        (v) =>
          v.id === video.id ||
          (v.title?.trim() === video.title?.trim() && v.videoUrl === video.videoUrl)
      )

      let updated: SavedVideo[]
      if (existsIndex !== -1) {
        // Update the existing entry instead of creating duplicates
        updated = [...prev]
        updated[existsIndex] = { ...updated[existsIndex], ...video }
      } else {
        updated = [video, ...prev]
      }
      saveStoredSavedVideos(updated)
      return updated
    })
  }

  const handleDeleteVideo = (id: string) => {
    setSavedVideos((prev) => {
      const updated = prev.filter((v) => v.id !== id)
      saveStoredSavedVideos(updated)
      return updated
    })
  }

  const handleClearAllVideos = () => {
    setSavedVideos([])
    saveStoredSavedVideos([])
  }

  const handleSelectTrend = (trend: TrendItem) => {
    // Formatar uma ideia limpa e focada no tema real, sem prefixos robóticos
    const cleanTopic = trend.topic || trend.tag
    const promptText = trend.hookIdea
      ? `"${trend.hookIdea}" — ${cleanTopic}`
      : `${cleanTopic}: ${trend.insight}`

    setSelectedPromptIdea(promptText)
    if (trend.visualStyleRecommended) {
      setSelectedStyleName(trend.visualStyleRecommended)
    }
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
        savedVideosCount={savedVideos.length}
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
            initialStyleName={selectedStyleName}
            styles={VISUAL_STYLES}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveVideo={handleSaveVideo}
          />
        )}
        {tab === 'metrics' && (
          <MetricsSection
            initialMetrics={MOCK_METRICS}
            initialTips={MOCK_TIPS}
            savedVideos={savedVideos}
            onDeleteVideo={handleDeleteVideo}
            onClearAllVideos={handleClearAllVideos}
            onGoToStudio={() => setTab('studio')}
          />
        )}
        {tab === 'saved_videos' && (
          <SavedVideosSection
            videos={savedVideos}
            onDeleteVideo={handleDeleteVideo}
            onClearAll={handleClearAllVideos}
            onGoToStudio={() => setTab('studio')}
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
