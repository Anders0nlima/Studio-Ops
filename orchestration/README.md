# Camada de Inteligência e Agentes Locais (StudioOps) 🧠⚡

Esta pasta contém toda a engenharia de prompt, schemas de validação e cliente de comunicação para executar os 3 agentes de IA especializados usando o **Ollama local** (custo zero e 100% privado).

---

## 📋 O que você precisa fazer por fora (Setup do Ollama)

Para deixar a **Branch 2 funcional na sua máquina**, siga estes 3 passos simples no seu Windows:

### 1. Garantir que o Ollama está instalado e rodando
O Ollama já está instalado no seu computador em `C:\Users\ander\AppData\Local\Programs\Ollama\ollama.exe`.
- Verifique se o ícone do Ollama (a lhaminha branca) está aparecendo na bandeja do sistema (ao lado do relógio do Windows).
- Caso não esteja, abra o menu Iniciar e digite **Ollama** para iniciá-lo.
- Para testar no terminal PowerShell:
  ```powershell
  ollama --version
  ```

### 2. Baixar o modelo recomendado
Abra um terminal (PowerShell ou Prompt de Comando) e baixe o modelo Llama 3:
```powershell
ollama pull llama3:8b
```
> 💡 *Dica de Desempenho:* Se você quiser uma alternativa ainda mais leve e rápida para testes diários sem ocupar muita memória RAM, pode usar o modelo de 3 bilhões de parâmetros:
> ```powershell
> ollama pull llama3.2:3b
> ```

### 3. Testar o modelo no terminal
Basta rodar:
```powershell
ollama run llama3:8b "Diga olá em uma frase"
```
Se ele responder, o Ollama está pronto para atender os agentes do StudioOps na porta `http://localhost:11434`!

---

## 🤖 Os 3 Agentes de IA

1. **Coolhunter Agent (`orchestration/prompts/coolhunter.prompt.md`):**
   - Analisa tópicos e dados culturais em alta.
   - Devolve JSON estruturado com tag, métrica de crescimento estimada, estilo visual sugerido (Cyberpunk, Anime, Pixar 3D, Cinematic) e gancho inicial.

2. **Roteirista & Engenheiro de Prompt (`orchestration/prompts/roteirista.prompt.md`):**
   - Cria o roteiro de 15 segundos em 3 blocos obrigatórios de retenção:
     - **Gancho (0–3s):** Máximo de 14 palavras para quebrar o scroll imediatamente.
     - **Corpo (3–12s):** Entre 15 e 25 palavras de valor acelerado.
     - **CTA (12–15s):** Entre 4 e 10 palavras forçando comentários ou loop.
   - Gera os prompts visuais em **Inglês** com proporção vertical `9:16` para a geração de imagem (SDXL/Flux no Colab).

3. **Growth Hacker Agent (`orchestration/prompts/growth_hacker.prompt.md`):**
   - Cria títulos magnéticos com gatilhos mentais (POV, Curiosidade).
   - Escreve legendas que forçam debate nos comentários.
   - Gera de 6 a 8 hashtags em 3 camadas (Ampla, Nicho e Específica).

---

## 🧪 Como rodar a Suíte de Testes dos Agentes

No terminal, na raiz do projeto:
```powershell
python orchestration/scripts/test_agents_suite.py
```
O teste valida automaticamente 10 cenários reais de conteúdo (Tech, Finanças, Saúde, Culinária, Carreira, etc.) garantindo conformidade com o schema Pydantic e as regras de retenção de 15 segundos.
