import { NextRequest, NextResponse } from 'next/server'
import { GeneratedScript, GrowthMetadata } from '@/types/studio'

// Helper to sanitize topic if it contains trend metadata labels
function cleanTopicString(raw: string): { topic: string; hook?: string } {
  let cleaned = raw.trim()
  let extractedHook: string | undefined

  // Extract hook if prefixed with "Gancho de Retenção (0-3s):" or similar
  const hookMatch = cleaned.match(/gancho(?: de retenção)?(?:\s*\(0-3s\))?:\s*["“]?([^"”\n]+)["”]?/i)
  if (hookMatch && hookMatch[1]) {
    extractedHook = hookMatch[1].trim()
  }

  // Extract clean topic if prefixed with "Tema viral:" or "Tema:"
  const topicMatch = cleaned.match(/tema(?: viral)?:\s*([^—\n]+)/i)
  if (topicMatch && topicMatch[1]) {
    cleaned = topicMatch[1].trim()
  } else if (cleaned.includes('—')) {
    const parts = cleaned.split('—')
    cleaned = parts[parts.length - 1].trim()
  }

  // Remove trailing focus/retention strings
  cleaned = cleaned.replace(/Foco de retenção:[\s\S]*$/i, '').trim()
  cleaned = cleaned.replace(/^["“]|["”]$/g, '').trim()

  return {
    topic: cleaned || raw,
    hook: extractedHook,
  }
}

// Semantic topic domain detector
interface DomainContent {
  hook: string
  body: string
  cta: string
  img1: string
  img2: string
  img3: string
  title: string
  description: string
  hashtags: string[]
  audioVibe: string
}

function generateDomainContent(topic: string, style: string, customHook?: string): DomainContent {
  const t = topic.toLowerCase()
  const s = style.toLowerCase()

  // 1. SOCCER / FUTEBOL / SPORTS
  if (
    t.includes('soccer') ||
    t.includes('futebol') ||
    t.includes('football') ||
    t.includes('gol') ||
    t.includes('chute') ||
    t.includes('bola') ||
    t.includes('messi') ||
    t.includes('cristiano') ||
    t.includes('neymar') ||
    t.includes('champions') ||
    t.includes('esporte') ||
    t.includes('copa')
  ) {
    const hook = customHook || 'O lance que desafiou as leis da física e chocou o mundo inteiro.'
    return {
      hook,
      body: 'Em uma cobrança lendária, uma curva inacreditável contornou a barreira por fora e morreu no ângulo sem chances de defesa.',
      cta: 'Qual foi o gol mais espetacular da história do futebol? Deixe seu voto nos comentários!',
      img1: `Dramatic high-speed close-up of a soccer player striking a glowing soccer ball with immense power, flying grass, intense stadium lights, ${s} style, photorealistic cinematic lighting, vertical 9:16 aspect ratio`,
      img2: `Spectacular wide view behind the goal showing the soccer ball bending in an impossible aerodynamic curve into the top corner, crowded roaring stadium, ${s} style, 8k, vertical 9:16 aspect ratio`,
      img3: `Golden champion trophy and soccer boots with dramatic atmospheric lens flare, confetti falling, ${s} style, vertical 9:16`,
      title: 'O chute que desafiou as leis da física no futebol',
      description: 'Você lembra dessa falta histórica? A curva aerodinâmica que cientistas tentam explicar até hoje. Comente seu gol favorito! #futebol #soccer',
      hashtags: ['#futebol', '#soccer', '#gols', '#championsleague', '#skills', '#esporte', '#viral'],
      audioVibe: 'Epic Orchestral Stadium Bass 128BPM',
    }
  }

  // 2. CANADA / VIAGEM / TRAVEL / NATUREZA
  if (
    t.includes('canada') ||
    t.includes('canadá') ||
    t.includes('viagem') ||
    t.includes('travel') ||
    t.includes('morar fora') ||
    t.includes('imigrar') ||
    t.includes('intercambio') ||
    t.includes('inverno') ||
    t.includes('montanha') ||
    t.includes('banff')
  ) {
    const hook = customHook || 'Três segredos sobre a vida no Canadá que ninguém te conta.'
    return {
      hook,
      body: 'Com invernos de trinta e cinco graus negativos e lagos cristalinos surreais, o choque cultural canadense vai muito além do frio.',
      cta: 'Você teria coragem de encarar o inverno no Canadá? Deixe sua resposta nos comentários!',
      img1: `Breathtaking high quality vertical shot of picturesque snow-covered streets in Quebec Canada at twilight, glowing lanterns, cozy snowfall, ${s} style, cinematic 8k, vertical 9:16 aspect ratio`,
      img2: `Stunning vertical landscape of Lake Louise Banff Canada, emerald glacial turquoise water surrounded by towering snow-capped Rocky Mountains, ${s} style, 8k photography, vertical 9:16 aspect ratio`,
      img3: `Cozy Canadian wooden mountain cabin under glowing green Northern Lights aurora borealis in the starry night sky, ${s} style, vertical 9:16`,
      title: 'A vida real no Canadá que ninguém te mostra',
      description: 'Você teria coragem de encarar -35°C? Conheça as paisagens mais surreais e o choque cultural de morar no Canadá. Comente se você moraria lá! #canada #viagem #intercambio',
      hashtags: ['#canada', '#viagem', '#intercambio', '#morarfora', '#inverno', '#curiosidades', '#viral'],
      audioVibe: 'Crisp Ambient Nordic Acoustic Echo 110BPM',
    }
  }

  // 3. CARS / VELOCIDADE
  if (t.includes('carro') || t.includes('car') || t.includes('motor') || t.includes('velocidade') || t.includes('porsche') || t.includes('ferrari')) {
    const hook = customHook || 'O motor mais potente do mundo que quase foi banido das ruas.'
    return {
      hook,
      body: 'Com aceleração de zero a cem em menos de dois segundos, este monstro de engenharia quebrou todos os recordes da pista.',
      cta: 'Você teria coragem de pilotar uma máquina dessa? Comente SIM ou NÃO!',
      img1: `Aggressive front angle close-up of a sleek supercar revving at night, glowing LED headlights, rain reflections on asphalt, ${s} style, 8k, vertical 9:16 aspect ratio`,
      img2: `Supercar accelerating at supersonic speed on empty highway with glowing taillight streaks, motion blur, ${s} style, cinematic volumetric smoke, vertical 9:16`,
      img3: `Futuristic digital dashboard revving past the redline with glowing turbo boost gauges, ${s} style, vertical 9:16`,
      title: 'O hipercarro que quebrou as leis da velocidade',
      description: 'Zero a cem em 1.8 segundos. Veja os segredos dessa obra prima automotiva. Você teria coragem? #carros #supercars',
      hashtags: ['#carros', '#supercars', '#automotivo', '#velocidade', '#motor', '#viral'],
      audioVibe: 'Aggressive Cyber Bass & Engine Rev 130BPM',
    }
  }

  // 3. FITNESS / TREINO / SAÚDE
  if (t.includes('fitness') || t.includes('treino') || t.includes('academia') || t.includes('gym') || t.includes('emagrec') || t.includes('muscul')) {
    const hook = customHook || 'O erro no treino que está destruindo seus ganhos e ninguém te conta.'
    return {
      hook,
      body: 'Fazer repetições rápidas sem controle desativa as fibras musculares principais e multiplica o risco de lesão nas articulações.',
      cta: 'Quantas vezes na semana você treina? Deixe sua rotina nos comentários!',
      img1: `Intense athletic athlete gripping heavy barbell in moody atmospheric gym, chalk dust suspended in air, ${s} style, dramatic rim lighting, vertical 9:16 aspect ratio`,
      img2: `Anatomical 3D glowing visualization of muscle fibers activating under resistance tension, ${s} style, high contrast, 8k, vertical 9:16`,
      img3: `Athlete triumphant after completing intense set, sweat droplets catching light, ${s} style, cinematic depth of field, vertical 9:16`,
      title: 'O maior erro de execução no treino de força',
      description: 'Pare de desperdiçar energia na academia! Corrija esse detalhe simples e dobre sua hipertrofia. Comente sua rotina! #treino #fitness',
      hashtags: ['#fitness', '#treino', '#academia', '#musculacao', '#saude', '#gymtok', '#viral'],
      audioVibe: 'High Energy Motivational Trap 140BPM',
    }
  }

  // 4. FINANÇAS / INVESTIMENTOS / DINHEIRO
  if (t.includes('finan') || t.includes('dinheiro') || t.includes('invest') || t.includes('dolar') || t.includes('renda') || t.includes('rico') || t.includes('crypto') || t.includes('bitcoin')) {
    const hook = customHook || 'Se você tem dinheiro parado na poupança, pare de perder valor agora.'
    return {
      hook,
      body: 'A inflação silenciosa consome seu poder de compra ano a ano, enquanto ativos em moeda forte multiplicam seu patrimônio no piloto automático.',
      cta: 'Você já começou a investir este ano? Comente seu principal objetivo financeiro!',
      img1: `Dramatic visual of cash dissolving into glowing digital particles against a dark city skyline, ${s} style, volumetric lighting, vertical 9:16 aspect ratio`,
      img2: `Holographic financial growth chart curving upward in neon emerald green over glass skyscraper, ${s} style, 8k, vertical 9:16`,
      img3: `Minimalist vault door opening to reveal glowing gold bars and futuristic currency symbols, ${s} style, cinematic lighting, vertical 9:16`,
      title: 'A armadilha financeira que drena 90% dos brasileiros',
      description: 'O segredo de quem faz o dinheiro trabalhar por si mesmo em vez de trabalhar pelo dinheiro. Comente sua meta financeira! #financas #investimentos',
      hashtags: ['#financas', '#investimentos', '#dinheiro', '#rendapassiva', '#dolar', '#riqueza', '#viral'],
      audioVibe: 'Deep Ambient Lo-Fi Chillwave 90BPM',
    }
  }

  // 5. CULINÁRIA / GASTRONOMIA / COMIDA
  if (t.includes('culin') || t.includes('comida') || t.includes('food') || t.includes('receita') || t.includes('burger') || t.includes('restaurante')) {
    const hook = customHook || 'O segredo dos chefs de restaurante para nunca mais errar o ponto.'
    return {
      hook,
      body: 'A reação de Maillard precisa de calor extremo e carne completamente seca para formar a crosta crocante perfeita por fora e suculenta por dentro.',
      cta: 'Qual o seu prato favorito da vida? Compartilhe nos comentários!',
      img1: `Extreme close-up of sizzling artisan burger meat searing on blazing cast iron skillet, golden flames, ${s} style, cinematic steam, vertical 9:16 aspect ratio`,
      img2: `Delicious cross-section cut of gourmet food revealing perfect juicy pink center and melted cheese, ${s} style, 8k, vertical 9:16`,
      img3: `Gourmet dish beautifully plated with microgreens and drizzle sauce on dark stone table, warm restaurant lighting, ${s} style, vertical 9:16`,
      title: 'O segredo da crosta crocante de restaurante em casa',
      description: 'Essa técnica simples vai transformar a sua culinária para sempre. Teste hoje mesmo! Comente seu prato favorito! #culinaria #receita',
      hashtags: ['#culinaria', '#receitas', '#gastronomia', '#foodtok', '#comida', '#burger', '#viral'],
      audioVibe: 'Upbeat Acoustic Acoustic Groove 115BPM',
    }
  }

  // 6. DEFAULT / GENERAL ADAPTIVE (Uses the actual topic intelligently)
  const hook = customHook || `Você sabia que quase tudo que te contaram sobre ${topic} tem um lado secreto?`
  return {
    hook,
    body: `Pesquisas recentes revelaram que um detalhe contraintuitivo sobre ${topic} é capaz de transformar completamente a percepção das pessoas.`,
    cta: `Você já sabia dessa curiosidade sobre ${topic}? Deixe sua opinião sincera abaixo!`,
    img1: `High-impact striking opening visual capturing ${topic}, dramatic atmospheric composition, cinematic lighting, ${s} style, 8k render, vertical 9:16 aspect ratio`,
    img2: `Detailed deep-dive scene exploring the core elements of ${topic}, stunning visual textures, rich lighting, ${s} aesthetic, vertical 9:16 aspect ratio`,
    img3: `Inspiring conclusion scene highlighting the impact of ${topic}, cinematic lens flare and warm glow, ${s} style, vertical 9:16`,
    title: `A verdade surpreendente sobre ${topic}`,
    description: `Descubra a curiosidade que quase ninguém conhece sobre ${topic}. Comente sua opinião abaixo! #viral #curiosidades`,
    hashtags: ['#curiosidades', '#aprendanotiktok', '#fatos', '#conhecimento', '#viral', '#trending'],
    audioVibe: 'Atmospheric Cinematic Synthwave 120BPM',
  }
}

export async function POST(request: NextRequest) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const rawTopic = body.topic || 'Como a inteligência artificial cria vídeos em segundos'
  const style = body.style || 'Cyberpunk'
  const duration = body.duration || '15s'
  const voice = body.voice || 'pt-BR-FranciscaNeural'
  const n8nUrl = body.n8nUrl || request.headers.get('x-n8n-url') || 'http://localhost:5678'

  const { topic, hook: extractedHook } = cleanTopicString(rawTopic)

  // 1. TENTATIVA: n8n Webhook
  if (n8nUrl) {
    try {
      const cleanUrl = n8nUrl.replace(/\/$/, '')
      const n8nRes = await fetch(`${cleanUrl}/webhook/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, duration, voice, hook: extractedHook }),
        signal: AbortSignal.timeout(4000),
      })

      if (n8nRes.ok) {
        const data = await n8nRes.json()
        if (data.script && data.growth) {
          return NextResponse.json({
            success: true,
            source: 'n8n_live',
            script: data.script,
            growth: data.growth,
          })
        }
      }
    } catch {
      // Segue para Ollama local
    }
  }

  // 2. TENTATIVA: Ollama Local Direto
  try {
    const ollamaUrl = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
    const systemPrompt = `Você é o Roteirista & Growth Hacker de vídeos curtos do TikTok.
Crie um roteiro de 15 segundos em 3 blocos estritamente sobre "${topic}" no estilo visual "${style}".
IMPORTANTE:
- Todas as 3 imagens devem descrever cenas REAIS sobre "${topic}" no estilo visual "${style}" com formato "vertical 9:16 aspect ratio".
- NUNCA mencione StudioOps, edição de vídeo ou tecnologia a não ser que o tema solicitado seja explicitamente sobre tecnologia/IA.
- Se o tema for futebol/esporte, descreva lances de futebol/esporte em todas as 3 cenas!

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "script": {
    "topic": "${topic}",
    "style": "${style}",
    "targetDuration": "15s",
    "totalWordCount": 35,
    "scenes": [
      {"order": 1, "type": "hook", "timeRange": "0-3s", "narrationText": "...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"},
      {"order": 2, "type": "body", "timeRange": "3-12s", "narrationText": "...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"},
      {"order": 3, "type": "cta", "timeRange": "12-15s", "narrationText": "...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"}
    ],
    "fullNarration": "..."
  },
  "growth": {
    "title": "...",
    "description": "...",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
    "callToActionQuestion": "...",
    "suggestedAudioVibe": "..."
  }
}`

    const userPrompt = `Gere o roteiro e metadados virais para o tema: "${topic}". ${extractedHook ? `Use este gancho nos primeiros 3s: "${extractedHook}".` : ''}`

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
      signal: AbortSignal.timeout(45000),
    })

    if (ollamaRes.ok) {
      const ollamaData = await ollamaRes.json()
      let rawResp = ollamaData.response || ''
      rawResp = rawResp.replace(/^```json\s*|\s*```$/g, '').trim()
      const parsed = JSON.parse(rawResp)

      if (parsed.script && parsed.growth && parsed.script.scenes?.length >= 3) {
        return NextResponse.json({
          success: true,
          source: 'ollama_live',
          script: parsed.script,
          growth: parsed.growth,
        })
      }
    }
  } catch {
    // Segue para Semantic Content Generator
  }

  // 3. TENTATIVA: Semantic Content Generator (100% focado no tema do usuário)
  const content = generateDomainContent(topic, style, extractedHook)

  const generatedScript: GeneratedScript = {
    topic,
    styleName: style,
    duration,
    scenes: [
      {
        order: 1,
        type: 'hook',
        timeRange: '0-3s',
        narrationText: content.hook,
        imagePromptEnglish: content.img1,
      },
      {
        order: 2,
        type: 'body',
        timeRange: '3-12s',
        narrationText: content.body,
        imagePromptEnglish: content.img2,
      },
      {
        order: 3,
        type: 'cta',
        timeRange: '12-15s',
        narrationText: content.cta,
        imagePromptEnglish: content.img3,
      },
    ],
    fullNarration: `${content.hook} ${content.body} ${content.cta}`,
  }

  const generatedGrowth: GrowthMetadata = {
    title: content.title.slice(0, 70),
    description: content.description,
    hashtags: content.hashtags,
    callToActionQuestion: content.cta,
    suggestedAudioVibe: content.audioVibe,
  }

  return NextResponse.json({
    success: true,
    source: 'semantic_engine',
    script: generatedScript,
    growth: generatedGrowth,
  })
}
