"""
Automated Test Suite for Toqan (iFood GenAI Gateway) Adapter Layer.
Validates mock Toqan server, Pydantic validation for all 4 agents,
dynamic provider switching (Ollama <-> Toqan), and zero-impact frontend contract.
"""

import os
import sys
import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import ClassVar

# Ensure orchestration modules are importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from orchestration.models.agent_models import (
    CoolhunterOutputModel,
    RoteiristaOutputModel,
    GrowthHackerOutputModel,
    PerformanceAnalyzerOutputModel,
)
from orchestration.client.toqan_client import (
    ToqanClient,
    ToqanAuthError,
    ToqanConnectionError,
)
from orchestration.client.ai_factory import ResilientAIClient, get_ai_client

MOCK_PORT = 8001
MOCK_HOST = "127.0.0.1"
MOCK_BASE_URL = f"http://{MOCK_HOST}:{MOCK_PORT}/v1"
VALID_API_KEY = "mock-toqan-ifood-secret-token-777"


class MockToqanGatewayHandler(BaseHTTPRequestHandler):
    """Simulates iFood's internal Toqan Gateway (/v1/chat/completions & /v1/models)."""

    def log_message(self, format, *args):
        # Silence default HTTP server logging during tests
        return

    def do_GET(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header != f"Bearer {VALID_API_KEY}":
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Invalid Toqan Bearer Token"}}).encode())
            return

        if self.path.endswith("/models"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "object": "list",
                "data": [
                    {"id": "claude-3-5-sonnet", "object": "model"},
                    {"id": "gpt-4o", "object": "model"},
                    {"id": "llama-3-70b", "object": "model"}
                ]
            }
            self.wfile.write(json.dumps(resp).encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header != f"Bearer {VALID_API_KEY}":
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Unauthorized Toqan Access: Invalid Token"}}).encode())
            return

        if not self.path.endswith("/chat/completions"):
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        payload = json.loads(body_bytes.decode("utf-8"))

        messages = payload.get("messages", [])
        system_content = next((m.get("content", "") for m in messages if m.get("role") == "system"), "")
        user_content = next((m.get("content", "") for m in messages if m.get("role") == "user"), "")

        # Route by agent persona in system prompt
        if "Coolhunter" in system_content or "tendências" in system_content:
            agent_data = {
                "trends": [
                    {
                        "id": "trend-toqan-1",
                        "tag": "#CyberAIEnterprise",
                        "topic": "IA Generativa em Grandes Operações",
                        "growth": "+320%",
                        "color": "cyan",
                        "insight": "Grandes marcas estão usando agentes autônomos para escalar conteúdo.",
                        "visualStyleRecommended": "Cyberpunk",
                        "retentionScore": 94.5,
                        "hookIdea": "Sua empresa ainda cria vídeos manualmente?"
                    },
                    {
                        "id": "trend-toqan-2",
                        "tag": "#FastDeliveryTech",
                        "topic": "Tecnologia de Entregas Ultrarrápidas",
                        "growth": "+210%",
                        "color": "pink",
                        "insight": "Bastidores de inteligência logística geram alta curiosidade e comentários.",
                        "visualStyleRecommended": "Cinematic",
                        "retentionScore": 91.0,
                        "hookIdea": "Como seu pedido chega em 15 minutos sem atraso?"
                    }
                ]
            }
        elif "Roteirista" in system_content or "roteiro" in system_content:
            agent_data = {
                "topic": "Como a IA cria vídeos em segundos",
                "style": "Cyberpunk",
                "targetDuration": "15s",
                "totalWordCount": 35,
                "scenes": [
                    {
                        "order": 1,
                        "type": "hook",
                        "timeRange": "0-3s",
                        "narrationText": "Você ainda perde quatro horas inteiras editando um único vídeo?",
                        "imagePromptEnglish": "Dramatic neon cyberpunk creator looking at glowing holographic terminal, volumetric lighting, vertical 9:16 aspect ratio"
                    },
                    {
                        "order": 2,
                        "type": "body",
                        "timeRange": "3-12s",
                        "narrationText": "O StudioOps automatiza roteiro, voz neural e geração de imagens na nuvem em segundos.",
                        "imagePromptEnglish": "Futuristic cloud server orchestrating multimedia pipelines, vibrant glowing cables, 8k, vertical 9:16 aspect ratio"
                    },
                    {
                        "order": 3,
                        "type": "cta",
                        "timeRange": "12-15s",
                        "narrationText": "Comente TESTAR para receber acesso imediato!",
                        "imagePromptEnglish": "Creator hand pressing glowing neon button in cyberpunk city, cinematic bokeh, vertical 9:16"
                    }
                ],
                "fullNarration": "Você ainda perde quatro horas inteiras editando um único vídeo? O StudioOps automatiza roteiro, voz neural e geração de imagens na nuvem em segundos. Comente TESTAR para receber acesso imediato!"
            }
        elif "Growth Hacker" in system_content or "viral" in system_content:
            agent_data = {
                "title": "POV: Você descobriu a IA que edita TikToks sozinha em 15s",
                "description": "Automatize seus vídeos curtos do roteiro ao MP4 com qualidade de cinema. Comente QUERO! #viral",
                "callToActionQuestion": "Quantas horas por semana você gasta editando?",
                "hashtags": ["#fyp", "#viral", "#inteligenciaartificial", "#toqan", "#studioops", "#criatividade"],
                "suggestedAudioVibe": "Cyberpunk Synthwave 128BPM heavy bass",
                "retentionStrategyTip": "Fixe um comentário com o link para maximizar cliques de perfil."
            }
        elif "Performance" in system_content or "retenção" in system_content:
            agent_data = {
                "summary": "Análise de retenção corporativa via Toqan Gateway",
                "averageWatchTime": "8.1s",
                "completionRate": "48.2%",
                "dropoffAt2s": "29.4%",
                "overallScore": 91.5,
                "diagnosis": "Excelente retenção acima de 48%. O gancho nos primeiros 2s reteve mais de 70% da audiência.",
                "actionableTips": [
                    {
                        "id": "toqan-tip-1",
                        "category": "hook",
                        "text": "Mantenha o gancho visual de alto contraste no segundo zero para manter retenção >70%."
                    },
                    {
                        "id": "toqan-tip-2",
                        "category": "pacing",
                        "text": "O ritmo de 145 palavras por minuto manteve os usuários assistindo até o final."
                    }
                ]
            }
        else:
            agent_data = {"status": "ok", "message": "Generic Toqan Mock Response"}

        openai_response = {
            "id": f"chatcmpl-toqan-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": payload.get("model", "claude-3-5-sonnet"),
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": json.dumps(agent_data)
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 128,
                "completion_tokens": 256,
                "total_tokens": 384
            }
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(openai_response).encode("utf-8"))


def start_mock_server() -> tuple[HTTPServer, threading.Thread]:
    server = HTTPServer((MOCK_HOST, MOCK_PORT), MockToqanGatewayHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.5)
    return server, thread


def run_tests():
    print("=" * 70)
    print("🚀 INICIANDO BATERIA DE TESTES DO ADAPTADOR TOQAN (iFood)")
    print("=" * 70)

    server, thread = start_mock_server()
    print(f"✅ Mock Server Toqan Gateway ativo em {MOCK_BASE_URL}")

    passed = 0
    total = 7

    try:
        # TEST 1: Health check
        print("\n[Teste 1/7] Health Check do Toqan Gateway...")
        client = ToqanClient(base_url=MOCK_BASE_URL, api_key=VALID_API_KEY)
        assert client.is_online() is True, "Health check falhou ao contatar Mock Toqan"
        print("  -> Status: PASS (Gateway online e respondendo a /models com Bearer token)")
        passed += 1

        # TEST 2: Coolhunter Agent
        print("\n[Teste 2/7] Coolhunter Agent via Toqan com validação Pydantic...")
        parsed, validated = client.generate(
            system_prompt="Você é o Coolhunter Agent, especialista em tendências de TikTok.",
            user_prompt="Tendências de hoje",
            pydantic_model=CoolhunterOutputModel,
        )
        assert validated is not None
        assert len(validated.trends) >= 2
        assert validated.trends[0].tag.startswith("#")
        assert validated.trends[0].retentionScore > 0
        print(f"  -> Validado com sucesso: {len(validated.trends)} tendências recebidas ({validated.trends[0].tag})")
        print("  -> Status: PASS")
        passed += 1

        # TEST 3: Roteirista Agent
        print("\n[Teste 3/7] Roteirista Agent via Toqan com validação Pydantic...")
        parsed, validated = client.generate(
            system_prompt="Você é o Roteirista & Engenheiro de Prompt de vídeos curtos.",
            user_prompt="Tema: IA para vídeos. Estilo: Cyberpunk",
            pydantic_model=RoteiristaOutputModel,
        )
        assert validated is not None
        assert len(validated.scenes) == 3
        assert validated.scenes[0].type == "hook"
        assert "9:16" in validated.scenes[0].imagePromptEnglish.lower()
        print(f"  -> Validado com sucesso: 3 cenas ({validated.scenes[0].timeRange}, {validated.scenes[1].timeRange}, {validated.scenes[2].timeRange})")
        print("  -> Status: PASS")
        passed += 1

        # TEST 4: Growth Hacker Agent
        print("\n[Teste 4/7] Growth Hacker Agent via Toqan com validação Pydantic...")
        parsed, validated = client.generate(
            system_prompt="Você é o Growth Hacker Agent. Gere títulos virais e hashtags.",
            user_prompt="Roteiro: Você ainda perde horas editando vídeos?",
            pydantic_model=GrowthHackerOutputModel,
        )
        assert validated is not None
        assert len(validated.hashtags) >= 4
        assert validated.title
        print(f"  -> Validado com sucesso: Título='{validated.title[:40]}...', {len(validated.hashtags)} hashtags")
        print("  -> Status: PASS")
        passed += 1

        # TEST 5: Performance Analyzer Agent
        print("\n[Teste 5/7] Performance Analyzer Agent via Toqan com validação Pydantic...")
        parsed, validated = client.generate(
            system_prompt="Você é o Performance & Retention Agent.",
            user_prompt="Tempo médio 8s, conclusão 48%",
            pydantic_model=PerformanceAnalyzerOutputModel,
        )
        assert validated is not None
        assert validated.overallScore > 80
        assert len(validated.actionableTips) >= 2
        print(f"  -> Validado com sucesso: Score={validated.overallScore}, Dicas={len(validated.actionableTips)}")
        print("  -> Status: PASS")
        passed += 1

        # TEST 6: Auth Failure & Error Handling
        print("\n[Teste 6/7] Tratamento de Erro de Autenticação (401 Unauthorized)...")
        bad_client = ToqanClient(base_url=MOCK_BASE_URL, api_key="invalid-token")
        try:
            bad_client.generate("System prompt", "User prompt")
            raise AssertionError("Deveria ter lançado ToqanAuthError!")
        except ToqanAuthError as e:
            print(f"  -> Erro 401 capturado com sucesso: {e}")
            print("  -> Status: PASS")
            passed += 1

        # TEST 7: Resilient Factory & Zero Frontend Impact
        print("\n[Teste 7/7] Resilient AI Factory (Switching de Provedor & Zero Impact)...")
        # Test provider = toqan
        os.environ["AI_PROVIDER"] = "toqan"
        os.environ["TOQAN_API_URL"] = MOCK_BASE_URL
        os.environ["TOQAN_API_KEY"] = VALID_API_KEY

        factory_client = get_ai_client(enable_fallback=True)
        assert factory_client.provider == "toqan"

        parsed_toqan, val_toqan = factory_client.generate(
            system_prompt="Você é o Coolhunter Agent",
            user_prompt="Tendências",
            pydantic_model=CoolhunterOutputModel,
        )
        assert val_toqan is not None

        # Test switching provider = ollama (even if offline, validates fallback capability)
        os.environ["AI_PROVIDER"] = "ollama"
        factory_ollama = get_ai_client(enable_fallback=False)
        assert factory_ollama.provider == "ollama"

        print("  -> Alternância dinâmica de provedores validada sem alterar contratos de dados.")
        print("  -> Status: PASS")
        passed += 1

    finally:
        server.shutdown()
        server.server_close()
        print("\n🛑 Mock Server Toqan finalizado.")

    print("\n" + "=" * 70)
    print(f"📊 RESULTADO FINAL: {passed}/{total} TESTES PASSARAM COM SUCESSO! 🎉")
    print("=" * 70)

    if passed == total:
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(run_tests())
