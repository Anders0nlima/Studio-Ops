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
  problem: string
  solution: string
  body: string
  cta: string
  img1: string
  img2: string
  img3: string
  img4: string
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
    const hook = customHook || 'O chute que desafiou as leis da física e chocou o mundo inteiro.'
    const problem = 'Goleiros de elite admitem que chutes com efeito Magnus externo são impossíveis de calcular em frações de segundo.'
    const solution = 'A rotação milimétrica a mais de 115 km/h faz a bola contornar a barreira e mergulhar direto no ângulo morto.'
    const cta = 'Qual foi o gol de falta mais inacreditável da história? Deixe seu voto nos comentários!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Dramatic high-speed macro action close-up of soccer boot striking glowing soccer ball with immense kinetic power, flying grass particles, stadium floodlights, ${s} style, 8k, photorealistic vertical 9:16 aspect ratio`,
      img2: `Spectacular wide view behind the goal showing ball curving in an impossible aerodynamic trajectory past the outstretched goalkeeper hands, crowded stadium, ${s} style, vertical 9:16`,
      img3: `Cinematic 3D scientific vector overlay visualizing airflow aerodynamic turbulence around rotating soccer ball, ${s} style, hyper-detailed, vertical 9:16`,
      img4: `Glorious golden champion trophy under dramatic atmospheric stadium lens flare with falling confetti, ${s} style, vertical 9:16`,
      title: 'O chute que desafiou as leis da física no futebol',
      description: 'Você lembra dessa falta lendária? A curva aerodinâmica que cientistas estudam até hoje. Qual o gol mais espetacular da história? Comente! #futebol #soccer',
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
    const problem = 'O inverno a menos trinta e cinco graus congela seus cílios em dois minutos e transforma sair de casa em uma expedição polar.'
    const solution = 'Em compensação, o poder de compra com salário mínimo e a vista surreal dos lagos de Banff fazem tudo valer a pena.'
    const cta = 'Você teria coragem de encarar esse inverno congelante? Deixe sua resposta nos comentários!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Breathtaking high quality vertical shot of picturesque snow-covered streets in Quebec Canada at twilight, glowing lanterns, cozy snowfall, ${s} style, cinematic 8k, vertical 9:16 aspect ratio`,
      img2: `Extreme macro close-up of winter traveler face with frozen frosted eyelashes and warm wool scarf under sub-zero blizzard, ${s} style, vertical 9:16`,
      img3: `Stunning vertical landscape of Lake Louise Banff Canada, emerald glacial turquoise water surrounded by towering snow-capped Rocky Mountains, ${s} style, 8k photography, vertical 9:16 aspect ratio`,
      img4: `Cozy Canadian wooden mountain cabin under glowing green Northern Lights aurora borealis in starry night sky, ${s} style, vertical 9:16`,
      title: 'A vida real no Canadá que ninguém te mostra',
      description: 'Você teria coragem de encarar -35°C? Conheça as paisagens mais surreais e o choque cultural de morar no Canadá. Comente se você moraria lá! #canada #viagem #intercambio',
      hashtags: ['#canada', '#viagem', '#intercambio', '#morarfora', '#inverno', '#curiosidades', '#viral'],
      audioVibe: 'Crisp Ambient Nordic Acoustic Echo 110BPM',
    }
  }

  // 3. CARS / VELOCIDADE
  if (t.includes('carro') || t.includes('car') || t.includes('motor') || t.includes('velocidade') || t.includes('porsche') || t.includes('ferrari')) {
    const hook = customHook || 'O motor mais potente do mundo que quase foi banido das pistas.'
    const problem = 'A mais de 350 km/h, a pressão aerodinâmica gera tanta força que qualquer erro milimétrico de direção é fatal.'
    const solution = 'Com chassi de fibra de carbono e turbos duplos híbridos, essa máquina faz de zero a cem em inacreditáveis 1.8 segundos.'
    const cta = 'Você teria coragem de acelerar um hipercarro desses? Comente SIM ou NÃO!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Aggressive front angle close-up of a sleek supercar revving at night, glowing LED headlights, rain reflections on asphalt, ${s} style, 8k, vertical 9:16 aspect ratio`,
      img2: `Twin-turbo internal combustion engine glowing red hot with mechanical precision and exposed titanium manifolds, ${s} style, vertical 9:16`,
      img3: `Supercar accelerating at supersonic speed on empty highway with glowing taillight streaks, motion blur, ${s} style, cinematic volumetric smoke, vertical 9:16`,
      img4: `Futuristic digital dashboard revving past the redline with glowing turbo boost gauges, ${s} style, vertical 9:16`,
      title: 'O hipercarro que quebrou as leis da velocidade',
      description: 'Zero a cem em 1.8 segundos. Veja os segredos dessa obra prima automotiva. Você teria coragem? #carros #supercars',
      hashtags: ['#carros', '#supercars', '#automotivo', '#velocidade', '#motor', '#viral'],
      audioVibe: 'Aggressive Cyber Bass & Engine Rev 130BPM',
    }
  }

  // 4. FITNESS / TREINO / SAÚDE
  if (t.includes('fitness') || t.includes('treino') || t.includes('academia') || t.includes('gym') || t.includes('emagrec') || t.includes('muscul')) {
    const hook = customHook || 'O erro no treino que está destruindo seus ganhos e ninguém te conta.'
    const problem = 'Fazer repetições aceleradas rouba a tensão mecânica do músculo e transfere todo o desgaste para os seus tendões.'
    const solution = 'Controle a descida do peso em três segundos: isso ativa o dobro de microlesões hipertróficas sem precisar aumentar a carga.'
    const cta = 'Quantas vezes na semana você treina? Compartilhe sua rotina nos comentários!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Intense athletic athlete gripping heavy barbell in moody atmospheric gym, chalk dust suspended in air, ${s} style, dramatic rim lighting, vertical 9:16 aspect ratio`,
      img2: `Biomechanical 3D anatomical visualization of bicep and shoulder muscle fibers lighting up under extreme resistance, ${s} style, high contrast, vertical 9:16`,
      img3: `Athlete controlling slow eccentric barbell descent with veins popping and maximum focus, ${s} style, cinematic 8k, vertical 9:16`,
      img4: `Athlete triumphant after completing intense set, sweat droplets catching studio light, ${s} style, cinematic depth of field, vertical 9:16`,
      title: 'O maior erro de execução no treino de força',
      description: 'Pare de desperdiçar energia na academia! Corrija a cadência das repetições e dobre sua hipertrofia. Comente sua rotina! #treino #fitness',
      hashtags: ['#fitness', '#treino', '#academia', '#musculacao', '#saude', '#gymtok', '#viral'],
      audioVibe: 'High Energy Motivational Trap 140BPM',
    }
  }

  // 5. FINANÇAS / INVESTIMENTOS / DINHEIRO / 50 REAIS / DÓLAR
  if (
    t.includes('finan') ||
    t.includes('dinheiro') ||
    t.includes('invest') ||
    t.includes('dolar') ||
    t.includes('dólar') ||
    t.includes('renda') ||
    t.includes('rico') ||
    t.includes('banco') ||
    t.includes('50') ||
    t.includes('reais') ||
    t.includes('poupanca') ||
    t.includes('poupança') ||
    t.includes('crypto') ||
    t.includes('bitcoin')
  ) {
    const hook = customHook || 'Se você tem 50 reais parados no banco, pare de perder dinheiro agora.'
    const problem = 'A inflação real devora seu poder de compra todo santo dia, enquanto o dólar valorizou mais de 300% na última década.'
    const solution = 'Com menos de 10 dólares, você já compra frações dos maiores ativos globais e começa a receber dividendos em moeda forte.'
    const cta = 'Qual foi o primeiro investimento que você já fez na vida? Comente aqui embaixo que eu respondo todos!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Cinematic macro close-up of real bank notes and coins on a dark wooden table with moody amber studio rim lighting, digital clock accelerating in background, ${s} style, photorealistic 8k, vertical 9:16 aspect ratio`,
      img2: `Dramatic high contrast visualization of inflation eroding paper currency into glowing red dust while an emerald green dollar index curve surges upward across Wall Street skyscrapers, ${s} style, volumetric lighting, vertical 9:16`,
      img3: `Sleek modern smartphone held by an investor displaying an investment portfolio receiving incoming dollar dividend payments with glowing gold particles, ${s} style, depth of field, vertical 9:16`,
      img4: `Prestigious modern vault door opening to reveal gleaming gold bars and global currency signs illuminated by atmospheric cinematic light flares, ${s} style, vertical 9:16`,
      title: 'O segredo de quem faz 50 reais renderem em dólar',
      description: 'Pare de deixar dinheiro parado na poupança perdendo para a inflação! Conheça a estratégia de dolarização com aportes pequenos. Comente se você já investe! #financas #dolar #investimentos',
      hashtags: ['#financas', '#investimentos', '#dolar', '#rendapassiva', '#dinheiro', '#educacaofinanceira', '#viral'],
      audioVibe: 'Deep Ambient Lo-Fi Chillwave 90BPM',
    }
  }

  // 6. CULINÁRIA / GASTRONOMIA / COMIDA
  if (t.includes('culin') || t.includes('comida') || t.includes('food') || t.includes('receita') || t.includes('burger') || t.includes('restaurante')) {
    const hook = customHook || 'O segredo dos chefs de restaurante para nunca mais errar o ponto.'
    const problem = 'Colocar carne fria e úmida na frigideira cria vapor de água, cozinhando a peça por fora em vez de dourar.'
    const solution = 'Seque a superfície com papel toalha e espere a frigideira fumegar: a reação de Maillard cria uma crosta crocante e suculenta.'
    const cta = 'Qual o seu prato favorito da vida? Compartilhe a receita nos comentários!'
    return {
      hook,
      problem,
      solution,
      body: `${problem} ${solution}`,
      cta,
      img1: `Extreme close-up of sizzling artisan burger meat searing on blazing cast iron skillet, golden flames, ${s} style, cinematic steam, vertical 9:16 aspect ratio`,
      img2: `Macro shot of paper towel absorbing excess moisture from thick marbled raw steak on chef cutting board, ${s} style, vertical 9:16`,
      img3: `Delicious cross-section cut of gourmet food revealing perfect juicy pink center and melted cheese, ${s} style, 8k, vertical 9:16`,
      img4: `Gourmet dish beautifully plated with microgreens and drizzle sauce on dark stone table, warm restaurant lighting, ${s} style, vertical 9:16`,
      title: 'O segredo da crosta crocante de restaurante em casa',
      description: 'Essa técnica culinária simples vai transformar a sua comida para sempre. Teste hoje mesmo! Comente seu prato favorito! #culinaria #receita',
      hashtags: ['#culinaria', '#receitas', '#gastronomia', '#foodtok', '#comida', '#burger', '#viral'],
      audioVibe: 'Upbeat Acoustic Acoustic Groove 115BPM',
    }
  }

  // 7. DEFAULT / GENERAL ADAPTIVE (Uses the actual topic with a rich 4-step framework)
  const hook = customHook || `Você sabia que quase tudo que te contaram sobre ${topic} tem um lado oculto?`
  const problem = `A maioria das pessoas comete o erro clássico de focar no detalhe errado, desperdiçando tempo e esforço sem ver progresso real.`
  const solution = `Quando você inverte a lógica e prioriza o fundamento prático de ${topic}, o resultado aparece três vezes mais rápido.`
  const cta = `Você já sabia dessa curiosidade sobre ${topic}? Deixe sua opinião sincera abaixo!`
  return {
    hook,
    problem,
    solution,
    body: `${problem} ${solution}`,
    cta,
    img1: `High-impact striking opening visual capturing ${topic}, dramatic atmospheric composition, cinematic lighting, ${s} style, 8k render, vertical 9:16 aspect ratio`,
    img2: `Intense visualization revealing the core problem and challenge behind ${topic}, dark moody contrast, ${s} style, vertical 9:16`,
    img3: `Detailed dynamic breakthrough scene revealing the practical solution for ${topic}, rich vibrant lighting, ${s} aesthetic, vertical 9:16 aspect ratio`,
    img4: `Inspiring conclusion scene highlighting the full triumph and impact of ${topic}, cinematic lens flare and warm glow, ${s} style, vertical 9:16`,
    title: `A verdade surpreendente sobre ${topic.slice(0, 45)}`,
    description: `Descubra a técnica e os segredos práticos por trás de ${topic}. O que você acha? Comente abaixo! #viral #curiosidades`,
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
    const systemPrompt = `Você é o Roteirista & Growth Hacker sênior de vídeos virais do TikTok.
Crie um roteiro denso, completo e de alto valor prático de 15 segundos estruturado em 4 cenas rápidas sobre "${topic}" no estilo visual "${style}".
IMPORTANTE:
- Não seja vago! Entregue dados reais, números, contraste de ideias e passos concretos.
- Crie cortes rápidos a cada 3 a 4 segundos com prompts de imagem ricos em inglês (formato vertical 9:16 aspect ratio).
- Se o tema for finanças/investimentos/dólar, cite poder de compra, inflação e dividendos!

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "script": {
    "topic": "${topic}",
    "style": "${style}",
    "targetDuration": "15s",
    "totalWordCount": 42,
    "scenes": [
      {"order": 1, "type": "hook", "timeRange": "0-3s", "narrationText": "Gancho de choque de 0-3s...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"},
      {"order": 2, "type": "problem", "timeRange": "3-7s", "narrationText": "Dado revelador ou erro clássico...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"},
      {"order": 3, "type": "solution", "timeRange": "7-11s", "narrationText": "Solução prática acionável passo a passo...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"},
      {"order": 4, "type": "cta", "timeRange": "11-15s", "narrationText": "Pergunta provocativa nos comentários...", "imagePromptEnglish": "... vertical 9:16 aspect ratio"}
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

  // 3. TENTATIVA: Semantic Content Generator (100% focado no tema do usuário com 4 cenas de alto valor)
  const content = generateDomainContent(topic, style, extractedHook)

  const scenes =
    duration === '15s'
      ? [
          {
            order: 1,
            type: 'hook' as const,
            timeRange: '0-3s',
            narrationText: content.hook,
            imagePromptEnglish: content.img1,
          },
          {
            order: 2,
            type: 'problem' as const,
            timeRange: '3-7s',
            narrationText: content.problem,
            imagePromptEnglish: content.img2,
          },
          {
            order: 3,
            type: 'solution' as const,
            timeRange: '7-11s',
            narrationText: content.solution,
            imagePromptEnglish: content.img3,
          },
          {
            order: 4,
            type: 'cta' as const,
            timeRange: '11-15s',
            narrationText: content.cta,
            imagePromptEnglish: content.img4,
          },
        ]
      : [
          {
            order: 1,
            type: 'hook' as const,
            timeRange: '0-3s',
            narrationText: content.hook,
            imagePromptEnglish: content.img1,
          },
          {
            order: 2,
            type: 'body' as const,
            timeRange: duration === '10s' ? '3-7s' : '2-4s',
            narrationText: `${content.problem} ${content.solution}`,
            imagePromptEnglish: content.img2,
          },
          {
            order: 3,
            type: 'cta' as const,
            timeRange: duration === '10s' ? '7-10s' : '4-5s',
            narrationText: content.cta,
            imagePromptEnglish: content.img3,
          },
        ]

  const generatedScript: GeneratedScript = {
    topic,
    styleName: style,
    duration,
    scenes,
    fullNarration:
      duration === '15s'
        ? `${content.hook} ${content.problem} ${content.solution} ${content.cta}`
        : `${content.hook} ${content.problem} ${content.cta}`,
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
