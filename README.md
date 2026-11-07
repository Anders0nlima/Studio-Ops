# StudioOps 🎬⚡

Plataforma autônoma de automação de conteúdo para TikTok com custo zero. A partir de tendências diárias ou de um prompt do usuário, orquestra agentes de IA locais (Ollama), sintetiza mídia (áudio, imagem e vídeo) via Google Colab (GPU T4 gratuita) e entrega vídeos prontos com títulos, legendas e hashtags de alto engajamento.

## 🗺️ Arquitetura

```text
[ FRONTEND ] ➔ Dashboard Next.js 16 + Tailwind CSS
     │
     ▼ (HTTP / Webhooks)
[ ORQUESTRADOR ] ➔ n8n Local
     │
     ├─► [ INTELLIGENCE LAYER ] ➔ Ollama Local
     │     ├─ Agente 1: Coolhunter (Análise de Tendências)
     │     ├─ Agente 2: Roteirista & Prompt Engineer (Retenção 0-3s, 3-12s, 12-15s)
     │     └─ Agente 3: Growth Hacker (SEO, Títulos virais, Hashtags)
     │
     └─► [ MEDIA GENERATION LAYER ] ➔ Google Colab (T4 via Ngrok)
           ├─ TTS: Edge-TTS / Bark
           ├─ Imagem: SDXL / Flux.1 Schnell
           └─ Vídeo & Montagem: MoviePy (Ken Burns) / SVD
```

## 📂 Estrutura do Repositório

- `frontend/`: Aplicação web oficial (Next.js 16, React 19, Tailwind CSS).
- `orchestration/`: Workflows e system prompts para o n8n e Ollama.
- `colab/`: Notebook e scripts FastAPI para renderização de mídia na nuvem.
- `docs/`: Documentação técnica e guias de execução.
