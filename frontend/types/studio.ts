export type Tab = 'trends' | 'studio' | 'metrics'

export type AccentColor = 'cyan' | 'pink' | 'purple' | 'amber'

export interface TrendItem {
  id: string
  tag: string
  growth: string
  color: AccentColor
  insight: string
  image: string
  category?: string
  retentionScore?: number
  topic?: string
  hookIdea?: string
  visualStyleRecommended?: string
}

export interface VisualStyle {
  id: string
  name: string
  className: string
  promptKeywords: string
  description?: string
}

export type SceneType = 'hook' | 'body' | 'cta'

export interface ScriptScene {
  order: number
  type: SceneType
  timeRange: string
  narrationText: string
  imagePromptEnglish: string
}

export interface GeneratedScript {
  topic: string
  styleName: string
  duration: '5s' | '10s' | '15s'
  scenes: ScriptScene[]
  fullNarration: string
}

export interface GrowthMetadata {
  title: string
  description: string
  hashtags: string[]
  callToActionQuestion?: string
  suggestedAudioVibe?: string
  retentionStrategyTip?: string
}

export type PipelineStep =
  | 'idle'
  | 'scripting'
  | 'optimizing_seo'
  | 'dispatching_colab'
  | 'rendering_video'
  | 'completed'
  | 'error'

export interface VideoGenerationJob {
  id: string
  status: PipelineStep
  progress: number
  statusMessage: string
  videoUrl?: string
  script?: GeneratedScript
  metadata?: GrowthMetadata
  error?: string
}

export interface MetricCardData {
  id: string
  label: string
  value: string
  change: string
  color: AccentColor
  points: string
}

export interface PerformanceTip {
  id: string
  text: string
  category: 'hook' | 'timing' | 'retention' | 'cta' | 'pacing'
}

export interface TikTokVideoInfo {
  title: string
  author: string
  authorUrl?: string
  videoUrl?: string
  thumbnailUrl?: string
}

export interface MetricsAnalysisResult {
  summary: string
  overallScore: number
  tips: PerformanceTip[]
  metrics: MetricCardData[]
  source?: string
  videoInfo?: TikTokVideoInfo
}

export interface AgentInfo {
  id: string
  name: string
  role: string
  status: 'online' | 'busy' | 'offline'
  model: string
}

export interface ConnectionConfig {
  n8nUrl: string
  colabUrl: string
  ollamaModel: string
  autoPoll: boolean
}
