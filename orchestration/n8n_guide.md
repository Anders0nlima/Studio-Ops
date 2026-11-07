# Guia do Orquestrador n8n (StudioOps) ⚙️🔀

O **n8n** atua como o sistema nervoso central do StudioOps: ele recebe requisições do frontend, aciona os agentes especializados no Ollama local, valida os payloads e despacha as ordens de renderização de mídia.

---

## 📋 O que você precisa fazer por fora (Setup do n8n)

O n8n já está instalado na sua máquina! Para deixá-lo 100% ativo e funcional:

### 1. Iniciar o n8n no seu terminal
Na raiz do projeto (`c:\Projetos\Studio-Ops`), execute:
```powershell
npm run n8n
```
*(Ou simplesmente digite `n8n` no seu terminal PowerShell).*

O terminal mostrará uma mensagem indicando que o servidor está pronto:
```text
Editor is now accessible via:
http://localhost:5678/
```

### 2. Acessar o n8n no navegador
Abra o navegador e acesse: 👉 **`http://localhost:5678`**
*(Na primeira vez que abrir, ele pode pedir um cadastro local simples de email/senha para segurança do seu painel).*

### 3. Importar o Workflow Mestre em 1 Clique
1. No menu superior direito do n8n, clique em **Add Workflow** (ou crie um novo fluxo vazio).
2. Clique no menu de **três pontinhos (...)** no canto superior direito e selecione **Import from File...** (ou simplesmente pressione `Ctrl + O`).
3. Navegue até a pasta do projeto e selecione o arquivo:
   📁 `orchestration/workflows/studio_ops_master_workflow.json`
4. O fluxo completo com todos os 4 webhooks será carregado visualmente na tela!
5. Clique no botão **Save** (Salvar) e mude a chave de ativação para **Active** (Ativo).

Pronto! Seus 4 endpoints estarão operacionais ouvindo requisições na sua máquina.

---

## 🌐 Endpoints Disponíveis no n8n

| Endpoint | Método | Função |
| :--- | :--- | :--- |
| `http://localhost:5678/webhook/trends` | `POST` | Dispara o Coolhunter no Ollama e retorna tendências estruturadas. |
| `http://localhost:5678/webhook/generate-script` | `POST` | Gera roteiro de 15s (Gancho 0-3s, Corpo 3-12s, CTA 12-15s) e metadados de SEO. |
| `http://localhost:5678/webhook/dispatch-media` | `POST` | Envia o lote de prompts visuais e narração para a GPU na nuvem (Colab). |
| `http://localhost:5678/webhook/metrics-insights` | `POST` | Analisa métricas de retenção (CSV/JSON) e gera 3 recomendações do Performance Agent. |

---

## 🧪 Testando os Webhooks com cURL / PowerShell

Com o n8n rodando e o workflow ativo, você pode testar qualquer endpoint com um único comando:

### Teste 1: Buscar Tendências
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/trends" -Method POST -ContentType "application/json" -Body '{"category": "Tech"}'
```

### Teste 2: Gerar Roteiro de 15s
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/generate-script" -Method POST -ContentType "application/json" -Body '{"topic": "Como a IA cria vídeos em segundos", "style": "Cyberpunk"}'
```

### Teste 3: Suíte Automatizada de Resiliência
Você também pode rodar a suíte automatizada em Python a qualquer momento:
```powershell
npm run test:webhooks
```
*(Ou `python orchestration/scripts/test_n8n_webhooks.py`).*
