import { TrendItem, VisualStyle, MetricCardData, PerformanceTip, AgentInfo } from '@/types/studio'

export const MOCK_TRENDS: TrendItem[] = [
  {
    id: 'trend-1',
    tag: '#CyberpunkVibe',
    growth: '+245%',
    color: 'cyan',
    insight: 'Estética neon com cortes rápidos está dominando o feed noturno do TikTok.',
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
    category: 'Aesthetics',
    retentionScore: 92,
  },
  {
    id: 'trend-2',
    tag: '#SoftLifeReset',
    growth: '+189%',
    color: 'pink',
    insight: 'Conteúdos de autocuidado têm 2,4x mais salvamentos nesta semana.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=85',
    category: 'Lifestyle',
    retentionScore: 88,
  },
  {
    id: 'trend-3',
    tag: '#AIExplained',
    growth: '+164%',
    color: 'purple',
    insight: 'Vídeos que simplificam IA em 30 segundos geram conversas longas e compartilhamentos.',
    image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=85',
    category: 'Tech / Education',
    retentionScore: 85,
  },
  {
    id: 'trend-4',
    tag: '#StreetFoodTour',
    growth: '+132%',
    color: 'amber',
    insight: 'POVs autênticos e áudio ambiente aumentam a retenção até o final do vídeo.',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=85',
    category: 'Food / Travel',
    retentionScore: 79,
  },
  {
    id: 'trend-5',
    tag: '#MainCharacter',
    growth: '+118%',
    color: 'cyan',
    insight: 'Transições cinematográficas estão criando uma nova onda de vídeos aspiracionais.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=85',
    category: 'Trends',
    retentionScore: 82,
  },
  {
    id: 'trend-6',
    tag: '#MiniVlog',
    growth: '+94%',
    color: 'pink',
    insight: 'A rotina em cortes de 1 segundo conecta mais profundamente com a audiência jovem.',
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=85',
    category: 'Daily Vlog',
    retentionScore: 76,
  },
]

export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    className: 'style-cyber',
    promptKeywords: 'cyberpunk style, neon lights, futuristic city, highly detailed, octane render, 8k',
    description: 'Luzes neon e clima futurista com alto contraste',
  },
  {
    id: 'anime',
    name: 'Anime / Manga',
    className: 'style-anime',
    promptKeywords: 'makoto shinkai aesthetic, studio ghibli anime style, vibrant colors, detailed illustration',
    description: 'Traço refinado com estética japonesa contemporânea',
  },
  {
    id: 'pixar',
    name: 'Pixar 3D',
    className: 'style-pixar',
    promptKeywords: 'pixar 3d animation render, disney character style, warm studio lighting, 3d render',
    description: 'Render volumétrico carismático e expressivo',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    className: 'style-cinema',
    promptKeywords: '35mm film photography, cinematic lighting, movie still, photorealistic, anamorphic lens flare',
    description: 'Fotografia cinematográfica com granulação analógica',
  },
]

export const MOCK_METRICS: MetricCardData[] = [
  {
    id: 'metric-retention',
    label: 'Retenção Média (0–3s)',
    value: '68,4%',
    change: '+12,8%',
    color: 'cyan',
    points: '12,18 28,20 44,14 60,17 76,8 92,10 108,3',
  },
  {
    id: 'metric-views',
    label: 'Visualizações estimadas',
    value: '2,4M',
    change: '+32,1%',
    color: 'pink',
    points: '12,20 28,17 44,19 60,11 76,14 92,4 108,7',
  },
  {
    id: 'metric-engagement',
    label: 'Taxa de engajamento',
    value: '8,7%',
    change: '+4,2%',
    color: 'purple',
    points: '12,18 28,15 44,16 60,18 76,10 92,12 108,5',
  },
]

export const MOCK_TIPS: PerformanceTip[] = [
  {
    id: 'tip-1',
    category: 'hook',
    text: 'Seu gancho inicial perdeu 40% do público. Use uma imagem mais contrastante nos primeiros 2 segundos.',
  },
  {
    id: 'tip-2',
    category: 'timing',
    text: 'Vídeos publicados entre 19h e 21h tiveram 2,3x mais alcance na sua audiência.',
  },
  {
    id: 'tip-3',
    category: 'cta',
    text: 'Adicionar uma pergunta direta na legenda pode aumentar os comentários em até 18%.',
  },
]

export const MOCK_AGENTS: AgentInfo[] = [
  { id: '1', name: 'Coolhunter Agent', role: 'Detector de Tendências', status: 'online', model: 'Ollama: llama3' },
  { id: '2', name: 'Roteirista Agent', role: 'Retenção & Prompts', status: 'online', model: 'Ollama: llama3' },
  { id: '3', name: 'Growth Hacker', role: 'SEO, Títulos & Tags', status: 'online', model: 'Ollama: llama3' },
  { id: '4', name: 'Media Engine', role: 'Renderizador de Vídeo', status: 'online', model: 'Google Colab T4' },
]
