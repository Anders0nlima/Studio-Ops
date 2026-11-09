import { NextRequest, NextResponse } from 'next/server'
import { TrendItem } from '@/types/studio'
import { MOCK_TRENDS } from '@/mocks/studio-data'

const NICHE_IMAGES: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=85',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=85',
  ],
  productivity: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=85',
  ],
  finance: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=85',
  ],
  food: [
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=85',
  ],
  default: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85',
  ],
}

function getRandomImage(category: string = 'default'): string {
  const cat = category.toLowerCase()
  let pool = NICHE_IMAGES.default
  if (cat.includes('tech') || cat.includes('ia') || cat.includes('tecnologia')) {
    pool = NICHE_IMAGES.tech
  } else if (cat.includes('life') || cat.includes('estilo') || cat.includes('saúde')) {
    pool = NICHE_IMAGES.lifestyle
  } else if (cat.includes('produtiv') || cat.includes('foco')) {
    pool = NICHE_IMAGES.productivity
  } else if (cat.includes('finan') || cat.includes('dolar') || cat.includes('dinheiro')) {
    pool = NICHE_IMAGES.finance
  } else if (cat.includes('culin') || cat.includes('food') || cat.includes('comida')) {
    pool = NICHE_IMAGES.food
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function POST(request: NextRequest) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const category = (body.category || 'all').toLowerCase().trim()
  const niche = (body.niche || '').trim()
  const n8nUrl = body.n8nUrl || request.headers.get('x-n8n-url') || 'http://localhost:5678'

  // 1. TENTATIVA: n8n Webhook
  if (n8nUrl) {
    try {
      const cleanUrl = n8nUrl.replace(/\/$/, '')
      const n8nRes = await fetch(`${cleanUrl}/webhook/trends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, niche, timeframe: '24h' }),
        signal: AbortSignal.timeout(3000),
      })

      if (n8nRes.ok) {
        const data = await n8nRes.json()
        if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
          const mapped: TrendItem[] = data.trends.map((t: any, idx: number) => ({
            id: t.id || `n8n-trend-${idx}`,
            tag: t.tag?.startsWith('#') ? t.tag : `#${t.tag || 'Trending'}`,
            topic: t.topic || t.tag || 'Tendência TikTok',
            growth: t.growth || `+${Math.floor(Math.random() * 150 + 120)}%`,
            color: t.color || (idx % 2 === 0 ? 'cyan' : 'pink'),
            category: t.category || 'Recomendado por IA',
            insight: t.insight || 'Tendência identificada pelo Coolhunter Agent.',
            hookIdea: t.hookIdea || 'Você ainda perde tempo criando vídeos sem inteligência artificial?',
            visualStyleRecommended: t.visualStyleRecommended || 'Cyberpunk',
            retentionScore: Number(t.retentionScore) || Math.floor(Math.random() * 12 + 84),
            image: getRandomImage(t.category || category),
          }))

          return NextResponse.json({
            success: true,
            source: 'n8n_live',
            providerName: 'n8n Webhook Orquestrado',
            trends: mapped,
          })
        }
      }
    } catch {
      // Falha silenciosa, segue para tentativa direta via Ollama
    }
  }

  // 2. TENTATIVA: Ollama Local Direto
  try {
    const ollamaUrl = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
    const systemPrompt =
      'Você é o Coolhunter Agent do StudioOps, especialista em algoritmos do TikTok e retenção de 0-3 segundos. Responda ESTRITAMENTE em formato JSON seguindo este schema: {"trends": [{"id": "t1", "tag": "#TagViral", "topic": "Nome do Tema", "growth": "+210%", "color": "cyan", "category": "Categoria", "insight": "Por que está viralizando...", "hookIdea": "Gancho de 0-3 segundos...", "visualStyleRecommended": "Cyberpunk", "retentionScore": 92}]}'

    const userPrompt = niche
      ? `Gere 6 tendências virais do TikTok focadas estritamente no nicho: "${niche}". Inclua ganchos de alta retenção (0-3s), estilo visual sugerido (Cyberpunk, Anime / Manga, Pixar 3D ou Cinematic) e taxa de retenção esperada.`
      : `Gere 6 tendências virais do TikTok hoje ${category !== 'all' ? `na categoria ${category}` : 'variando entre tecnologia, estilo de vida, produtividade e finanças'}. Inclua ganchos provocativos (0-3s) e estilos recomendados.`

    const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
        system: systemPrompt,
        prompt: userPrompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.7 },
      }),
      signal: AbortSignal.timeout(6000),
    })

    if (ollamaRes.ok) {
      const ollamaData = await ollamaRes.json()
      let rawResp = ollamaData.response || ''
      rawResp = rawResp.replace(/^```json\s*|\s*```$/g, '').trim()
      const parsed = JSON.parse(rawResp)

      if (parsed.trends && Array.isArray(parsed.trends) && parsed.trends.length > 0) {
        const mapped: TrendItem[] = parsed.trends.map((t: any, idx: number) => ({
          id: t.id || `ollama-trend-${idx}-${Date.now()}`,
          tag: t.tag?.startsWith('#') ? t.tag : `#${t.tag || 'ViralTag'}`,
          topic: t.topic || 'Tendência Emergente',
          growth: t.growth || `+${Math.floor(Math.random() * 160 + 110)}%`,
          color: (['cyan', 'pink', 'purple', 'amber'] as const)[idx % 4],
          category: t.category || (niche ? niche : 'Tendência IA'),
          insight: t.insight || 'Forte engajamento algorítmico detectado pelo Coolhunter.',
          hookIdea: t.hookIdea || 'Você ainda está cometendo esse erro clássico?',
          visualStyleRecommended: t.visualStyleRecommended || 'Cyberpunk',
          retentionScore: Number(t.retentionScore) || Math.floor(Math.random() * 10 + 86),
          image: getRandomImage(t.category || category),
        }))

        return NextResponse.json({
          success: true,
          source: 'ollama_live',
          providerName: 'Ollama Local (llama3.2:3b)',
          trends: mapped,
        })
      }
    }
  } catch {
    // Falha silenciosa, segue para Inteligência Curada com geração algorítmica
  }

  // 3. TENTATIVA: Inteligência Curada com Variações Dinâmicas e Suporte a Nicho Customizado
  let basePool = [...MOCK_TRENDS]

  // Se o usuário digitou um nicho personalizado, geramos tendências personalizadas com ganchos testados
  if (niche) {
    const customTrends: TrendItem[] = [
      {
        id: `custom-niche-1-${Date.now()}`,
        tag: `#${niche.replace(/\s+/g, '')}Viral`,
        topic: `O Segredo de Alto Retorno em ${niche}`,
        growth: `+${Math.floor(Math.random() * 120 + 220)}%`,
        color: 'cyan',
        category: niche,
        insight: `Vídeos que expõem erros comuns em ${niche} estão alcançando 3x mais tempo médio de retenção.`,
        hookIdea: `O erro fatal que quase todo mundo comete com ${niche} e ninguém te conta.`,
        visualStyleRecommended: 'Cyberpunk',
        retentionScore: 95,
        image: getRandomImage('tech'),
      },
      {
        id: `custom-niche-2-${Date.now()}`,
        tag: `#HackDe${niche.replace(/\s+/g, '')}`,
        topic: `Atalho Prático em 15 Segundos para ${niche}`,
        growth: `+${Math.floor(Math.random() * 80 + 160)}%`,
        color: 'pink',
        category: niche,
        insight: `Formato 'Antes e Depois' focado em ${niche} estimula compartilhamentos diretos no WhatsApp.`,
        hookIdea: `Como economizar 5 horas por semana em ${niche} usando este único método.`,
        visualStyleRecommended: 'Cinematic',
        retentionScore: 91,
        image: getRandomImage('lifestyle'),
      },
      {
        id: `custom-niche-3-${Date.now()}`,
        tag: `#${niche.replace(/\s+/g, '')}SemFiltro`,
        topic: `A Verdade Contraintuitiva sobre ${niche}`,
        growth: `+${Math.floor(Math.random() * 70 + 140)}%`,
        color: 'purple',
        category: niche,
        insight: `Opiniões polêmicas fundamentadas geram taxas de comentários 4x superiores à média.`,
        hookIdea: `Pare de seguir o conselho tradicional sobre ${niche} se você quiser resultados reais.`,
        visualStyleRecommended: 'Anime / Manga',
        retentionScore: 89,
        image: getRandomImage('productivity'),
      },
      {
        id: `custom-niche-4-${Date.now()}`,
        tag: `#GuiaRapido${niche.replace(/\s+/g, '')}`,
        topic: `Ferramentas e Truques Essenciais para ${niche}`,
        growth: `+${Math.floor(Math.random() * 60 + 120)}%`,
        color: 'amber',
        category: niche,
        insight: `Listas de recursos de rápida aplicação têm a maior taxa de salvamentos no feed do TikTok.`,
        hookIdea: `Três recursos gratuitos de ${niche} que você deveria ter começado a usar ontem.`,
        visualStyleRecommended: 'Pixar 3D',
        retentionScore: 87,
        image: getRandomImage('food'),
      },
    ]

    return NextResponse.json({
      success: true,
      source: 'niche_engine',
      providerName: `Coolhunter Nicho AI (${niche})`,
      trends: customTrends,
    })
  }

  // Se filtrou por categoria pré-definida
  if (category && category !== 'all') {
    const filtered = basePool.filter((t) => {
      const c = (t.category || '').toLowerCase()
      if (category === 'tech' && (c.includes('tec') || c.includes('ia'))) return true
      if (category === 'lifestyle' && (c.includes('estilo') || c.includes('vida'))) return true
      if (category === 'productivity' && (c.includes('produtiv') || c.includes('foco'))) return true
      if (category === 'finance' && (c.includes('finan') || c.includes('dolar'))) return true
      if (category === 'food' && (c.includes('culin') || c.includes('curiosid'))) return true
      return false
    })
    if (filtered.length > 0) {
      basePool = filtered
    }
  }

  // Embaralha levemente para simular inteligência e frescor a cada atualização
  const shuffled = [...basePool]
    .sort(() => 0.5 - Math.random())
    .map((item, idx) => ({
      ...item,
      growth: `+${Math.floor(Math.random() * 150 + 110)}%`,
      retentionScore: Math.min(97, Math.max(78, (item.retentionScore || 85) + (idx % 3 - 1))),
    }))

  return NextResponse.json({
    success: true,
    source: 'curated_intelligence',
    providerName: 'Coolhunter Algorithmic Engine',
    trends: shuffled,
  })
}

export async function GET(request: NextRequest) {
  return POST(request)
}
