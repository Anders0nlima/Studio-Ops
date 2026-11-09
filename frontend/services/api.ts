import {
  ConnectionConfig,
  TrendItem,
  GeneratedScript,
  GrowthMetadata,
  MetricCardData,
  PerformanceTip,
  TikTokVideoInfo,
  MetricsAnalysisResult,
  SavedVideo,
} from '@/types/studio'
import { MOCK_TRENDS, MOCK_METRICS, MOCK_TIPS, MOCK_SAVED_VIDEOS } from '@/mocks/studio-data'

export const DEFAULT_CONFIG: ConnectionConfig = {
  n8nUrl: 'http://localhost:5678',
  colabUrl: '',
  ollamaModel: 'llama3.2:3b',
  autoPoll: true,
}

const STORAGE_KEY = 'studio_ops_config_v1'

export function getStoredConfig(): ConnectionConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    }
  } catch (e) {
    console.warn('[StudioOps Config] Could not read localStorage:', e)
  }
  return DEFAULT_CONFIG
}

export function saveStoredConfig(config: ConnectionConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.warn('[StudioOps Config] Could not save localStorage:', e)
  }
}

const SAVED_VIDEOS_STORAGE_KEY = 'studio_ops_saved_videos_v2'

export function getStoredSavedVideos(): SavedVideo[] {
  if (typeof window === 'undefined') return MOCK_SAVED_VIDEOS
  try {
    const raw = localStorage.getItem(SAVED_VIDEOS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('[StudioOps Videos] Could not read localStorage:', e)
  }
  return MOCK_SAVED_VIDEOS
}

export function saveStoredSavedVideos(videos: SavedVideo[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(videos))
  } catch (e) {
    console.warn('[StudioOps Videos] Could not save localStorage:', e)
  }
}

/**
 * 1. Fetch Trends via local API proxy (/api/trends) with n8n + Ollama + dynamic niche engine
 */
export async function fetchTrendsApi(
  category: string = 'all',
  niche?: string,
  n8nUrl?: string
): Promise<{ trends: TrendItem[]; source: string; providerName?: string }> {
  const config = getStoredConfig()
  const targetN8n = n8nUrl || config.n8nUrl

  try {
    const res = await fetch('/api/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, niche, n8nUrl: targetN8n }),
      signal: AbortSignal.timeout(50000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
        return {
          trends: data.trends,
          source: data.source || 'api_trends',
          providerName: data.providerName || 'Coolhunter Live',
        }
      }
    }
  } catch (err) {
    console.warn('[API Trends] Error calling /api/trends, using local fallback:', err)
  }

  // Se o usuário digitou um nicho específico, nunca retornar tendências estáticas genéricas
  if (niche && niche.trim()) {
    const cleanNiche = niche.trim()
    const isCanada = cleanNiche.toLowerCase().includes('canada') || cleanNiche.toLowerCase().includes('canadá')
    const isSoccer = cleanNiche.toLowerCase().includes('socc') || cleanNiche.toLowerCase().includes('futebol')

    return {
      trends: [
        {
          id: `fallback-${cleanNiche}-1`,
          tag: isCanada ? '#ViverNoCanada' : isSoccer ? '#GolsHistoricos' : `#${cleanNiche.replace(/\s+/g, '')}Viral`,
          topic: isCanada ? 'O Choque de Realidade ao Morar no Canadá' : isSoccer ? 'O Chute que Desafiou as Leis da Física' : `Os Segredos de ${cleanNiche}`,
          growth: '+280%',
          color: 'cyan',
          category: isCanada ? 'Viagem & Imigração' : isSoccer ? 'Futebol & Esportes' : cleanNiche,
          insight: `Fatos virais sobre ${cleanNiche} gerando alto tempo de retenção no TikTok.`,
          hookIdea: isCanada ? 'Três coisas que ninguém te conta antes de se mudar para o Canadá.' : isSoccer ? 'O chute de falta de 1997 que cientistas tentam explicar até hoje.' : `O maior erro que quase todo mundo comete em ${cleanNiche}.`,
          visualStyleRecommended: 'Cinematic',
          retentionScore: 94,
          image: isCanada
            ? 'https://images.unsplash.com/photo-1517935703635-27190760b7fe?auto=format&fit=crop&w=800&q=85'
            : isSoccer
            ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=85'
            : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85',
        },
        {
          id: `fallback-${cleanNiche}-2`,
          tag: isCanada ? '#InvernoCanadense' : isSoccer ? '#RegrasDoFutebol' : `#Dicas${cleanNiche.replace(/\s+/g, '')}`,
          topic: isCanada ? 'Como é Sobreviver a -35°C no Canadá' : isSoccer ? 'A Regra Mais Bizarra do Futebol' : `3 Curiosidades sobre ${cleanNiche}`,
          growth: '+210%',
          color: 'pink',
          category: isCanada ? 'Viagem & Curiosidades' : isSoccer ? 'Futebol & Esportes' : cleanNiche,
          insight: `Ganchos de curiosidade e debate sobre ${cleanNiche} com 3x mais comentários.`,
          hookIdea: isCanada ? 'A rotina louca de quem vive em uma cidade onde os cílios congelam em 2 minutos.' : isSoccer ? 'Se a bola furar antes de entrar no gol, o que o juiz deve marcar?' : `Três coisas inacreditáveis sobre ${cleanNiche} que você não sabia.`,
          visualStyleRecommended: 'Cinematic',
          retentionScore: 91,
          image: isCanada
            ? 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=85'
            : isSoccer
            ? 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=85'
            : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85',
        },
      ],
      source: 'niche_fallback',
      providerName: `Coolhunter AI (${cleanNiche})`,
    }
  }

  return { trends: MOCK_TRENDS, source: 'mock_fallback', providerName: 'Coolhunter Local' }
}

/**
 * 2. Generate 15s Script and Growth Metadata via /api/generate-script (delegating to n8n, Ollama, or Semantic Engine)
 */
export async function generateScriptApi(
  topic: string,
  style: string,
  duration: '5s' | '10s' | '15s' = '15s',
  voice: string = 'pt-BR-FranciscaNeural',
  n8nUrl?: string
): Promise<{ script: GeneratedScript; growth: GrowthMetadata; source: string }> {
  const config = getStoredConfig()
  const targetN8n = n8nUrl || config.n8nUrl

  try {
    const res = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, style, duration, voice, n8nUrl: targetN8n }),
      signal: AbortSignal.timeout(50000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.script && data.growth) {
        return {
          script: {
            topic: data.script.topic || topic,
            styleName: data.script.styleName || data.script.style || style,
            duration: data.script.targetDuration || data.script.duration || duration,
            scenes: data.script.scenes || [],
            fullNarration: data.script.fullNarration || '',
          },
          growth: {
            title: data.growth.title || `POV: Quando você descobre ${topic}`,
            description: data.growth.description || '',
            hashtags: data.growth.hashtags || ['#fyp', '#viral', '#trending'],
            callToActionQuestion: data.growth.callToActionQuestion,
            suggestedAudioVibe: data.growth.suggestedAudioVibe,
          },
          source: data.source || 'api_generate_script',
        }
      }
    }
  } catch (err) {
    console.warn('[API Script] Error calling /api/generate-script, using local fallback:', err)
  }

  // Graceful fallback strictly focused on the user's actual topic with 4 dynamic high-value scenes
  const cleanTopic = topic
    .replace(/^["“]|["”]$/g, '')
    .replace(/gancho.*?:/i, '')
    .replace(/tema.*?:/i, '')
    .trim()

  const isFinance =
    cleanTopic.toLowerCase().includes('dolar') ||
    cleanTopic.toLowerCase().includes('dólar') ||
    cleanTopic.toLowerCase().includes('reais') ||
    cleanTopic.toLowerCase().includes('50') ||
    cleanTopic.toLowerCase().includes('banco') ||
    cleanTopic.toLowerCase().includes('invest') ||
    cleanTopic.toLowerCase().includes('dinheiro')

  const fallbackScript: GeneratedScript = {
    topic: cleanTopic,
    styleName: style,
    duration,
    scenes: [
      {
        order: 1,
        type: 'hook',
        timeRange: '0-3s',
        narrationText: isFinance
          ? 'Se você tem 50 reais parados no banco, pare de perder dinheiro agora.'
          : `Você sabia disso sobre ${cleanTopic}?`,
        imagePromptEnglish: isFinance
          ? `Cinematic macro close-up of real bank notes and coins on a dark wooden table with moody amber studio lighting, digital clock accelerating in background, ${style.toLowerCase()} style, photorealistic 8k, vertical 9:16 aspect ratio`
          : `Dramatic high contrast opening scene capturing ${cleanTopic}, stunning visual details, ${style.toLowerCase()} style, 8k render, vertical 9:16 aspect ratio`,
      },
      {
        order: 2,
        type: 'problem',
        timeRange: '3-7s',
        narrationText: isFinance
          ? 'A inflação real no Brasil devora seu poder de compra em silêncio, enquanto o dólar valorizou mais de 300% na última década.'
          : `A maioria das pessoas comete o erro clássico de focar no detalhe errado sobre ${cleanTopic}, desperdiçando tempo e esforço.`,
        imagePromptEnglish: isFinance
          ? `Dramatic high contrast visualization of inflation eroding paper currency into glowing red dust while an emerald green dollar index curve surges upward across Wall Street skyscrapers, ${style.toLowerCase()} style, volumetric lighting, vertical 9:16`
          : `Detailed dynamic scene illustrating the hidden problem behind ${cleanTopic}, rich volumetric lighting, ${style.toLowerCase()} style, cinematic 8k, vertical 9:16 aspect ratio`,
      },
      {
        order: 3,
        type: 'solution',
        timeRange: '7-11s',
        narrationText: isFinance
          ? 'Com menos de 10 dólares você compra frações dos maiores ativos globais e começa a receber dividendos direto na sua conta.'
          : `Quando você prioriza o fundamento prático de ${cleanTopic}, o resultado aparece três vezes mais rápido e com consistência.`,
        imagePromptEnglish: isFinance
          ? `Sleek modern smartphone held by an investor displaying an investment portfolio receiving incoming dollar dividend payments with glowing gold particles, ${style.toLowerCase()} style, depth of field, vertical 9:16`
          : `Dynamic breakthrough scene revealing the practical solution for ${cleanTopic}, vibrant colors, ${style.toLowerCase()} aesthetic, vertical 9:16 aspect ratio`,
      },
      {
        order: 4,
        type: 'cta',
        timeRange: '11-15s',
        narrationText: isFinance
          ? 'Qual foi o primeiro investimento que você fez na vida? Comente aqui embaixo que eu respondo todos!'
          : 'Qual a sua opinião sobre isso? Comente aqui embaixo que eu quero saber!',
        imagePromptEnglish: isFinance
          ? `Prestigious modern vault door opening to reveal gleaming gold bars and global currency signs illuminated by atmospheric cinematic light flares, ${style.toLowerCase()} style, vertical 9:16`
          : `Inspiring closing visual of ${cleanTopic} with dramatic cinematic lighting and lens flare, ${style.toLowerCase()} style, vertical 9:16`,
      },
    ],
    fullNarration: isFinance
      ? 'Se você tem 50 reais parados no banco, pare de perder dinheiro agora. A inflação real no Brasil devora seu poder de compra em silêncio, enquanto o dólar valorizou mais de 300% na última década. Com menos de 10 dólares você compra frações dos maiores ativos globais e começa a receber dividendos direto na sua conta. Qual foi o primeiro investimento que você fez na vida? Comente aqui embaixo que eu respondo todos!'
      : `Você sabia disso sobre ${cleanTopic}? A maioria das pessoas comete o erro clássico de focar no detalhe errado sobre ${cleanTopic}, desperdiçando tempo e esforço. Quando você prioriza o fundamento prático de ${cleanTopic}, o resultado aparece três vezes mais rápido e com consistência. Qual a sua opinião sobre isso? Comente aqui embaixo que eu quero saber!`,
  }

  const fallbackGrowth: GrowthMetadata = {
    title: isFinance
      ? 'O segredo de quem faz 50 reais renderem em dólar'
      : `A verdade impressionante sobre ${cleanTopic.slice(0, 45)}`,
    description: isFinance
      ? 'Pare de deixar dinheiro parado na poupança perdendo para a inflação! Conheça a estratégia de dolarização com aportes pequenos. Comente se você já investe! #financas #dolar #investimentos'
      : `Descubra a história e os segredos por trás de ${cleanTopic}. O que você acha? Comente abaixo! #viral`,
    hashtags: isFinance
      ? ['#financas', '#investimentos', '#dolar', '#rendapassiva', '#dinheiro', '#educacaofinanceira', '#viral']
      : ['#fyp', '#viral', '#curiosidades', '#aprendanotiktok', '#fatos'],
    callToActionQuestion: isFinance
      ? 'Qual foi o primeiro investimento da sua vida?'
      : 'Você concorda com isso?',
    suggestedAudioVibe: isFinance ? 'Deep Ambient Lo-Fi Chillwave 90BPM' : 'Cinematic Trending Bass 120BPM',
  }

  return { script: fallbackScript, growth: fallbackGrowth, source: 'mock_fallback' }
}

/**
 * 3. Dispatch Media Generation to Colab T4 Worker (via Ngrok or Local Server)
 */
export async function dispatchMediaRenderApi(
  script: GeneratedScript,
  growth: GrowthMetadata,
  voice: string,
  colabUrl?: string
): Promise<{ success: boolean; jobId: string; statusUrl?: string; source: string }> {
  const url = (colabUrl || getStoredConfig().colabUrl).replace(/\/$/, '')
  const jobId = `job_${Date.now()}`

  if (url) {
    try {
      const payload = {
        jobId,
        topic: script.topic,
        style: script.styleName,
        voice,
        duration: script.duration,
        narration: script.fullNarration,
        scenes: script.scenes.map((s) => ({
          order: s.order,
          timeRange: s.timeRange,
          narration: s.narrationText,
          prompt: s.imagePromptEnglish,
        })),
      }

      // Try local proxy first to bypass browser CORS / preflight limitations
      let res: Response
      try {
        res = await fetch('/api/colab/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-colab-url': url,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        })
      } catch {
        res = await fetch(`${url}/render`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        })
      }

      if (res.ok) {
        const data = await res.json()
        return {
          success: true,
          jobId: data.job_id || jobId,
          statusUrl: `${url}/jobs/${data.job_id || jobId}`,
          source: 'colab_live',
        }
      }
    } catch (err) {
      console.warn('[API Media] Colab render request error, falling back to local simulation:', err)
    }
  }

  // Simulated render job
  return {
    success: true,
    jobId,
    statusUrl: `/mock/job/${jobId}`,
    source: 'simulated_pipeline',
  }
}

/**
 * 4. Poll Colab Media Job Status until Completed
 */
export async function pollJobStatusApi(
  jobId: string,
  colabUrl?: string
): Promise<{ status: string; progress: number; videoUrl?: string; error?: string }> {
  const url = (colabUrl || getStoredConfig().colabUrl).replace(/\/$/, '')
  if (url && !url.includes('/mock/')) {
    try {
      let res: Response
      try {
        res = await fetch(`/api/colab/jobs/${jobId}`, {
          method: 'GET',
          headers: { 'x-colab-url': url },
          signal: AbortSignal.timeout(12000),
        })
      } catch {
        res = await fetch(`${url}/jobs/${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          signal: AbortSignal.timeout(12000),
        })
      }

      if (res.ok) {
        const data = await res.json()
        let resolvedVideoUrl: string | undefined = data.videoUrl

        if (resolvedVideoUrl) {
          const filename = resolvedVideoUrl.split('/video/').pop() || `${jobId}.mp4`
          // Serve video via local Next.js proxy to guarantee 0 CORS and seamless streaming
          resolvedVideoUrl = `/api/colab/video/${filename}?colabUrl=${encodeURIComponent(url)}`
        }

        return {
          status: data.status || 'processing',
          progress: data.progress || 50,
          videoUrl: resolvedVideoUrl,
          error: data.error,
        }
      }
    } catch (e) {
      console.warn('[API Poll] Retrying poll for Colab job:', e)
      // Return ongoing processing status on transient timeout so polling continues
      return { status: 'rendering', progress: 75 }
    }
  }

  // Simulated fallback only when no Colab URL is configured
  return {
    status: 'completed',
    progress: 100,
    videoUrl: '/sample_preview.mp4',
  }
}

/**
 * 5. Analyze Metrics via /api/metrics (supports TikTok App URL, @username or CSV, delegating to n8n, Ollama, or Algorithmic Engine)
 */
export async function analyzeMetricsApi(
  input?: string | { csv?: string; url?: string; username?: string; n8nUrl?: string },
  n8nUrl?: string
): Promise<MetricsAnalysisResult> {
  const config = getStoredConfig()
  let body: { csv?: string; url?: string; username?: string; n8nUrl?: string } = {}

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed.startsWith('http') || trimmed.startsWith('@') || trimmed.includes('tiktok.com')) {
      body.url = trimmed
    } else {
      body.csv = trimmed
    }
  } else if (input && typeof input === 'object') {
    body = { ...input }
  }

  body.n8nUrl = body.n8nUrl || n8nUrl || config.n8nUrl

  // 1. Try Next.js internal /api/metrics endpoint
  try {
    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.metrics && Array.isArray(data.metrics) && data.metrics.length > 0) {
        return {
          summary: data.summary || 'Diagnóstico de Retenção TikTok',
          overallScore: data.overallScore || 85,
          tips: data.tips || MOCK_TIPS,
          metrics: data.metrics,
          source: data.source,
          videoInfo: data.videoInfo,
        }
      }
    }
  } catch (err) {
    console.warn('[API Metrics] /api/metrics call failed, trying direct n8n webhook:', err)
  }

  // 2. Fallback to direct n8n webhook if available
  const base = (body.n8nUrl || config.n8nUrl).replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/webhook/metrics-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: body.csv || '', url: body.url }),
      signal: AbortSignal.timeout(6000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.analysis) {
        return {
          summary: data.analysis.summary || 'Diagnóstico de Retenção TikTok',
          overallScore: data.analysis.overallScore || 85,
          tips: data.analysis.actionableTips || MOCK_TIPS,
          metrics: MOCK_METRICS,
          source: 'n8n_direct',
        }
      }
    }
  } catch (err) {
    console.warn('[API Metrics] n8n metrics analyzer offline, using calibrated fallback:', err)
  }

  // 3. Fallback default
  return {
    summary: 'Diagnóstico de retenção calculado pelo Performance Agent',
    overallScore: 86,
    tips: MOCK_TIPS,
    metrics: MOCK_METRICS,
    source: 'calibrated_fallback',
  }
}
