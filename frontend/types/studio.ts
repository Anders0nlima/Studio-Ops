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
  recommendedAudio?: string
  hookCritique?: string
}

export type JobStatus = 
  | 'idle'
  | 'scripting'
  | 'generating_media'
  | 'rendering_video'
  | 'completed'
  | 'error'

export interface VideoGenerationJob {
  id: string
  status: JobStatus
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
  category: 'hook' | 'timing' | 'retention' | 'cta'
}

export interface AgentInfo {
  id: string
  name: string
  role: string
  status: 'online' | 'busy' | 'offline'
  model: string
}
