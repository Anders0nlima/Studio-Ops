# Fábrica de Mídia na Nuvem: Google Colab GPU T4 + Ngrok 🎬⚡

Esta pasta contém o **Músculo de Mídia** do StudioOps: uma API FastAPI autônoma projetada para rodar em uma GPU Tesla T4 gratuita no Google Colab, gerando áudio neural, imagens de alta resolução (SDXL) e montando o vídeo vertical final de 15 segundos para o TikTok com movimento contínuo (Ken Burns).

---

## 📋 O que você precisa fazer por fora (Setup do Colab e Ngrok)

Para colocar a fábrica de mídia para rodar gratuitamente na nuvem, você só precisa de:
1. Uma conta Google (gratuita) para o Colab;
2. Uma conta gratuita no Ngrok para gerar o túnel público HTTPS.

### Passo 1: Pegar seu Token gratuito do Ngrok (1 minuto)
1. Acesse o site do Ngrok: 👉 **[https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)**
2. Crie sua conta gratuita com o Google ou Github;
3. No menu lateral, clique em **Your Authtoken** (ou acesse: [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken));
4. Copie o seu token (uma sequência de letras e números). Guarde-o para o próximo passo.

---

### Passo 2: Abrir e Rodar o Notebook no Google Colab
1. Acesse o Google Colab: 👉 **[https://colab.research.google.com](https://colab.research.google.com)**
2. Clique na aba **Upload** (Carregar) e selecione o arquivo do seu projeto:
   📁 [`colab/studio_ops_worker.ipynb`](file:///c:/Projetos/Studio-Ops/colab/studio_ops_worker.ipynb)
3. No menu superior do Colab, confirme se a GPU está ativa:
   - Clique em **Ambiente de execução (Runtime)** ➔ **Alterar tipo de ambiente de execução (Change runtime type)**;
   - Selecione **GPU T4** (gratuito) e clique em **Salvar**.
4. Execute as células sequencialmente (ou aperte `Ctrl + F9` para Executar Tudo):
   - Na célula do Ngrok, cole o seu token quando solicitado;
   - O Colab iniciará o servidor FastAPI e exibirá sua URL pública:
     ```text
     =================================================================
     🚀 COPIE ESTA URL PARA O N8N:
     https://xxxx-xx-xx-xxx.ngrok-free.app
     =================================================================
     ```

Pronto! Sua GPU T4 na nuvem está online, pronta para receber chamadas do n8n local!

---

## 🛠️ Arquitetura dos Módulos de Mídia

- **`colab/engine/tts_engine.py`**:
  - Utiliza **Edge-TTS** com vozes neurais brasileiras ultra-realistas (`pt-BR-FranciscaNeural` e `pt-BR-AntonioNeural`);
  - Consome **0 VRAM** da GPU e sintetiza o áudio completo em 1–2 segundos;
  - Calcula a minutagem exata de cada ato do vídeo.

- **`colab/engine/image_engine.py`**:
  - Utiliza **SDXL Turbo** (`stabilityai/sdxl-turbo`) em ponto flutuante `FP16`;
  - Ativa VAE Tiling e model CPU offload para manter o consumo de VRAM estritamente abaixo de **8GB** na GPU T4 (que possui 15GB), eliminando qualquer risco de erro *CUDA Out of Memory (OOM)*;
  - Gera as 3 imagens verticais de alta fidelidade em proporção `9:16` (Gancho, Corpo e CTA).

- **`colab/engine/video_engine.py`**:
  - Utiliza **MoviePy** para unir as imagens com o áudio sincronizado;
  - Aplica o efeito cinematográfico contínuo **Ken Burns (Pan & Zoom / Push-in)** para dar sensação de movimento de vídeo em vez de slides estáticos;
  - Exporta o arquivo final em `1080x1920` (30 fps, codec `H.264/AAC`), 100% formatado e compatível com as especificações do TikTok.

- **`colab/server.py`**:
  - Servidor assíncrono em **FastAPI** com endpoints:
    - `POST /render`: Inicia a fila de renderização em background (evita timeouts HTTP no n8n/proxy);
    - `GET /jobs/{id}`: Consulta o status do progresso (0% a 100%) e retorna a URL do MP4 gerado;
    - `GET /video/{filename}`: Rota de streaming do arquivo de vídeo final;
    - `GET /health`: Diagnóstico em tempo real da GPU e memória VRAM livre.

---

## 🧪 Suíte de Testes Automatizada

Você pode rodar os testes da esteira de mídia localmente a qualquer momento:
```powershell
python colab/tests/test_media_pipeline.py
```
O teste valida a síntese de áudio, geração de imagens 9:16, montagem do vídeo com Ken Burns e o registro de todas as rotas do FastAPI.
