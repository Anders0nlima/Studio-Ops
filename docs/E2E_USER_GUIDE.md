# Guia Completo de Operação End-to-End: StudioOps

Bem-vindo ao **StudioOps**, a primeira plataforma autônoma de geração de vídeos virais para TikTok com **custo zero permanente**.

---

## 🏗️ Arquitetura Integrada do Sistema

```
┌────────────────────────────────────────────────────────┐
│             FRONTEND (Next.js 16 + React 19)           │
│  - Tendências do Dia (Coolhunter)                      │
│  - Estúdio de Criação com Mockup 9:16 + Player TikTok  │
│  - Métricas & Insights (Diagnóstico de Retenção CSV)    │
│  - Modal de Conexões (Ngrok + n8n)                     │
└──────────────────────────┬─────────────────────────────┘
                           │ (HTTP REST / JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│           ORQUESTRADOR N8N (Porta 5678)                │
│  - POST /webhook/trends                                │
│  - POST /webhook/generate-script                       │
│  - POST /webhook/dispatch-media                        │
│  - POST /webhook/metrics-insights                      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     INTELIGÊNCIA LOCAL       │ │    MOTOR DE MÍDIA NA NUVEM   │
│       (Ollama Local)         │ │ (Google Colab T4 GPU + Ngrok)│
│  - Coolhunter (Tendências)   │ │  - Edge-TTS (Voz Neural PT)  │
│  - Roteirista (3 cenas 15s)  │ │  - SDXL Turbo FP16 (Imagens) │
│  - Growth Hacker (SEO/Tags)  │ │  - MoviePy (Zoom Ken Burns)  │
│  - Performance (Retenção)    │ │  - FastAPI Worker (Porta 8000│
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🚀 Passo a Passo para Operação 100% Funcional

### 1. Iniciar os Modelos Locais (Ollama)
No seu terminal local:
```bash
ollama run llama3.2:3b
```

### 2. Iniciar o Orquestrador n8n (Opcional se desejar fluxos visuais)
No terminal na raiz do projeto:
```bash
npm run n8n
```
*Acesse `http://localhost:5678` e ative o workflow `StudioOps Master Pipeline`.*

### 3. Iniciar o Motor de Mídia no Google Colab
1. Abra o arquivo [studio_ops_worker.ipynb](file:///c:/Projetos/Studio-Ops/colab/studio_ops_worker.ipynb) no Google Colab.
2. Certifique-se de selecionar a **GPU T4** gratuita em *Ambiente de Execução ➔ Alterar tipo de ambiente de execução*.
3. Execute todas as células em ordem:
   - **Célula 1 & 2:** Instalação e verificação de GPU.
   - **Célula 3:** Início do servidor FastAPI (SDXL Turbo + Edge-TTS + MoviePy).
   - **Célula 4:** Criação do túnel Ngrok seguro. Copie a URL gerada (ex: `https://xxxx-xx.ngrok-free.app`).

### 4. Abrir a Interface do StudioOps
No terminal dentro da pasta `frontend`:
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### 5. Configurar a Conexão no Painel
1. No menu lateral ou superior, clique no ícone de **Configurações** (engrenagem).
2. Cole a URL pública do Ngrok obtida no Colab.
3. Clique em **Testar Conexões** (o indicador ficará verde: `Online (GPU T4)`).
4. Clique em **Salvar Alterações**.

---

## 🎬 Fluxo de Criação de Vídeo em 4 Passos

1. **Tendências do Dia:**
   - Navegue pela aba **Tendências do Dia** e analise os ganchos com maior crescimento identificado pelo Coolhunter.
   - Clique em **"Criar vídeo sobre isso"** para enviar a ideia diretamente para o estúdio.

2. **Personalização no Estúdio:**
   - Escolha o estilo visual da IA (ex: *Cyberpunk*, *Dark Minimalist*, *3D Pixar*, *Anime Lo-Fi*).
   - Selecione a voz neural (ex: *FranciscaNeural* ou *AntonioNeural*).
   - Clique em **"Gerar vídeo para TikTok"**.

3. **Acompanhamento em Tempo Real:**
   - O painel exibirá o stepper visual com o tempo decorrido:
     - ✍️ **Roteirização TikTok:** Ganchos nos primeiros 0-3s, miolo de 3-12s e CTA de 12-15s.
     - 🚀 **Otimização SEO:** Geração instantânea de Título com gatilho viral, Descrição persuasiva e Hashtags estratégicas.
     - 🎨 **Geração de Imagens & Áudio:** SDXL Turbo em 9:16 vertical + Edge-TTS.
     - 🎬 **Renderização MP4:** Efeitos Ken Burns de aproximação contínua e codificação H.264.

4. **Visualização & Exportação:**
   - Assista ao vídeo diretamente no mockup do smartphone com controles interativos de play, pause e volume.
   - Clique no botão de download para baixar o arquivo `.mp4` final em alta definição.
   - Clique nos botões **"Copiar"** para colar o Título, Descrição e Hashtags no TikTok Studio com 1 clique!

---

## 📊 Análise de Métricas & Diagnóstico de Retenção

A aba **Métricas & Insights de IA** permite analisar o desempenho dos seus vídeos de duas formas:

### Opção 1: Puxar Direto do App TikTok (Link ou @Perfil)
1. Acesse a aba **Métricas & Insights**.
2. Selecione a opção **"Puxar do App TikTok (Link ou @Perfil)"**.
3. Cole a URL de qualquer vídeo do TikTok (ex: `https://www.tiktok.com/@tiktok/video/...`) ou o `@perfil` do criador (ou use os chips de exemplos rápidos).
4. Clique em **"Puxar Métricas do App"**.
5. O **Performance Agent** sincroniza os metadados do vídeo (título, autor, capa) e calcula automaticamente a curva de retenção, tempo médio e dicas de gancho.

### Opção 2: Upload de Relatório CSV (TikTok Analytics)
1. Selecione a opção **"Upload de CSV (TikTok Analytics)"**.
2. Faça upload do arquivo `.csv` exportado do TikTok Creator Center (ou clique em **"Carregar CSV de Amostra"**).
3. O **Performance Agent** extrai as colunas de retenção e gera 3 diagnósticos acionáveis para o seu próximo roteiro.

---

## 🎬 Biblioteca de Vídeos Salvos & Gerenciamento

Todos os vídeos gerados no **Estúdio de Criação** são salvos automaticamente no seu navegador (`localStorage`).

### Onde encontrar:
1. **No menu lateral**: Clique na nova aba **"Vídeos Salvos"** (localizada logo abaixo de *Métricas & Insights*).
2. **Na página de Métricas & Insights**: Role até o final da página para ver a seção **"Vídeos Salvos"** diretamente abaixo do diagnóstico do Agente de Retenção.

### Ações disponíveis para cada vídeo:
* ▶️ **Assistir**: Abre o player com o mockup de smartphone interativo.
* ⬇️ **Baixar MP4**: Baixa o arquivo final renderizado em alta resolução.
* 📋 **Copiar**: Copia o título com gatilho viral, descrição persuasiva e hashtags com 1 clique.
* 🗑️ **Apagar**: Remove o vídeo da sua biblioteca instantaneamente.
* 🧹 **Limpar Todos**: Remove todos os vídeos da biblioteca de uma só vez (com confirmação).
