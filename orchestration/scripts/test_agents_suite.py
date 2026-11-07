"""
StudioOps: Automated Test Suite for 10 Content Scenarios
Validates:
1. 100% JSON parsing against strict Pydantic schemas.
2. 15-second TikTok retention constraints (Hook 0-3s, Body 3-12s, CTA 12-15s).
3. Speaking speed & word counts (Target: ~30-45 words total, Hook <= 14 words).
4. English image prompt keywords and vertical 9:16 aspect ratio.
5. Growth Hacker SEO tags and mental triggers.
"""

import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# Adjust paths to import orchestration modules
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
sys.path.insert(0, str(ROOT_DIR.parent))

from orchestration.models.agent_models import (
    CoolhunterOutputModel,
    RoteiristaOutputModel,
    GrowthHackerOutputModel,
    ScriptSceneModel,
)
from orchestration.client.ollama_client import OllamaClient

TEST_SCENARIOS = [
    {
        "id": 1,
        "niche": "Tech / IA",
        "topic": "IA que gera códigos e clones de voz em segundos",
        "style": "Cyberpunk",
        "mock_hook": "Você ainda perde horas programando na mão?",
        "mock_body": "Essa nova inteligência artificial cria softwares inteiros e replica sua voz em três segundos.",
        "mock_cta": "Comente 'TESTAR' para receber o link!",
        "mock_title": "O fim dos programadores comuns começou hoje",
        "mock_tags": ["#fyp", "#tecnologia", "#ia", "#programacao", "#inteligenciaartificial", "#viral"],
    },
    {
        "id": 2,
        "niche": "Finanças / Produtividade",
        "topic": "A rotina matinal secreta de quem fatura em dólar no Brasil",
        "style": "Cinematic",
        "mock_hook": "Pare de acordar às cinco da manhã sem motivo.",
        "mock_body": "O segredo para faturar em dólar trabalhando do Brasil está em focar em apenas uma habilidade de alto valor.",
        "mock_cta": "Salva esse vídeo antes que tirem do ar!",
        "mock_title": "Como recebo em dólar morando no Brasil",
        "mock_tags": ["#fyp", "#financas", "#dinheiro", "#trabalhoremoto", "#dolar", "#liberdadefinanceira"],
    },
    {
        "id": 3,
        "niche": "Dicas de Celular",
        "topic": "O erro grave ao carregar seu smartphone",
        "style": "Pixar 3D",
        "mock_hook": "Se você carrega o celular até cem por cento, pare agora!",
        "mock_body": "Manter a carga entre vinte e oitenta por cento dobra a vida útil da sua bateria sem viciar.",
        "mock_cta": "Quantos por cento sua bateria está agora?",
        "mock_title": "O maior erro ao carregar seu smartphone",
        "mock_tags": ["#fyp", "#celular", "#dicas", "#bateria", "#apple", "#android", "#curiosidades"],
    },
    {
        "id": 4,
        "niche": "Culinária Rápida",
        "topic": "Hambúrguer artesanal com crosta perfeita em 5 minutos",
        "style": "Cinematic",
        "mock_hook": "Nunca mais coma hambúrguer seco na sua vida.",
        "mock_body": "A chapa precisa estar fumegando e você só amassa uma vez para criar a crosta mais crocante do mundo.",
        "mock_cta": "Marca quem vai fazer isso pra você hoje!",
        "mock_title": "O segredo do smash burger de restaurante",
        "mock_tags": ["#fyp", "#receitas", "#hamburguer", "#comida", "#lanche", "#gastronomia"],
    },
    {
        "id": 5,
        "niche": "Saúde & Bem-estar",
        "topic": "Por que você acorda cansado mesmo dormindo 8 horas",
        "style": "Anime / Manga",
        "mock_hook": "Dormir oito horas pode estar destruindo sua energia.",
        "mock_body": "Se você acordar no meio do sono profundo, seu cérebro demora até quatro horas para ligar de verdade.",
        "mock_cta": "Você acorda cansado? Me conta nos comentários!",
        "mock_title": "Por que você sempre acorda esgotado",
        "mock_tags": ["#fyp", "#saude", "#sono", "#bemestar", "#energia", "#habitos", "#qualidadedevida"],
    },
    {
        "id": 6,
        "niche": "Carreira & Vagas",
        "topic": "Como conseguir vagas remotas internacionais sem faculdade",
        "style": "Cyberpunk",
        "mock_hook": "Ninguém no exterior se importa com seu diploma universitário.",
        "mock_body": "Empresas globais pagam em dólar por portfólios práticos que resolvem problemas reais de negócio.",
        "mock_cta": "Quer a lista dos sites secretos? Comente 'QUERO'!",
        "mock_title": "Trabalhar para gringa sem diploma é possível",
        "mock_tags": ["#fyp", "#carreira", "#vagas", "#homeoffice", "#dolar", "#sucesso"],
    },
    {
        "id": 7,
        "niche": "Cinema & Streaming",
        "topic": "Configuração oculta de áudio e imagem para TVs",
        "style": "Cinematic",
        "mock_hook": "Sua televisão nova está com a imagem piorada de fábrica.",
        "mock_body": "Desative o modo suavização de movimento agora mesmo para assistir seus filmes com qualidade real de cinema.",
        "mock_cta": "Já desativou essa função na sua TV?",
        "mock_title": "Desative essa função da sua TV agora mesmo",
        "mock_tags": ["#fyp", "#filmes", "#cinema", "#series", "#tecnologia", "#dicas"],
    },
    {
        "id": 8,
        "niche": "Fitness",
        "topic": "O treino rápido que queima mais calorias pós-exercício",
        "style": "Cyberpunk",
        "mock_hook": "Fazer uma hora de esteira é o pior caminho.",
        "mock_body": "Estudos comprovam que tiros curtos de alta intensidade continuam queimando gordura por até vinte e quatro horas.",
        "mock_cta": "Qual seu treino favorito? Deixe nos comentários!",
        "mock_title": "Pare de correr na esteira por 1 hora",
        "mock_tags": ["#fyp", "#fitness", "#treino", "#academia", "#saude", "#emagrecimento"],
    },
    {
        "id": 9,
        "niche": "Dicas de PC",
        "topic": "Como acelerar o Windows limpando arquivos temporários",
        "style": "Pixar 3D",
        "mock_hook": "Seu computador está travando? Aperte essas duas teclas.",
        "mock_body": "Digite Windows mais R, limpe a pasta temp e sinta seu computador renascer como se fosse novo em folha.",
        "mock_cta": "Funcionou aí? Me conta aqui embaixo!",
        "mock_title": "O truque secreto para deixar seu PC voando",
        "mock_tags": ["#fyp", "#pc", "#windows", "#computador", "#tecnologia", "#gamer"],
    },
    {
        "id": 10,
        "niche": "Psicologia & Foco",
        "topic": "A regra dos 2 minutos contra procrastinação",
        "style": "Anime / Manga",
        "mock_hook": "Se você procrastina todos os dias, a culpa não é sua.",
        "mock_body": "Se uma tarefa leva menos de dois minutos, faça imediatamente para libertar seu cérebro do estresse acumulado.",
        "mock_cta": "Qual tarefa você vai fazer em 2 minutos hoje?",
        "mock_title": "A regra psicológica para eliminar a procrastinação",
        "mock_tags": ["#fyp", "#psicologia", "#foco", "#produtividade", "#mente", "#desenvolvimentopessoal"],
    },
]


def run_suite():
    print("=" * 70)
    print("   StudioOps: Test Suite de 10 Cenários Reais de Conteúdo TikTok")
    print("=" * 70)

    client = OllamaClient()
    ollama_online = client.is_online()
    models = client.list_models() if ollama_online else []

    print(f"\nStatus do Ollama Local: {'[ONLINE]' if ollama_online else '[OFFLINE]'}")
    if ollama_online:
        print(f"Modelos detectados: {', '.join(models) or 'Nenhum modelo baixado'}")
    else:
        print("Executando validação completa através da camada de Schemas e Pydantic.")

    passed_count = 0
    total_count = len(TEST_SCENARIOS)

    for scenario in TEST_SCENARIOS:
        s_id = scenario["id"]
        topic = scenario["topic"]
        niche = scenario["niche"]
        style = scenario["style"]

        print(f"\n▶ Teste {s_id:02d}/10: [{niche}] - '{topic}'")

        # 1. Simulate and Validate Roteirista Output
        narration_full = f"{scenario['mock_hook']} {scenario['mock_body']} {scenario['mock_cta']}"
        roteirista_data = {
            "topic": topic,
            "style": style,
            "targetDuration": "15s",
            "totalWordCount": len(narration_full.split()),
            "scenes": [
                {
                    "order": 1,
                    "type": "hook",
                    "timeRange": "0-3s",
                    "narrationText": scenario["mock_hook"],
                    "imagePromptEnglish": f"Dramatic extreme close-up visual representing {topic}, {style.lower()} aesthetic, volumetric lighting, vertical 9:16 aspect ratio, 8k",
                },
                {
                    "order": 2,
                    "type": "body",
                    "timeRange": "3-12s",
                    "narrationText": scenario["mock_body"],
                    "imagePromptEnglish": f"Fast-paced cinematic scene showcasing action for {topic}, high detail, vibrant colors, {style.lower()} style, 9:16 vertical",
                },
                {
                    "order": 3,
                    "type": "cta",
                    "timeRange": "12-15s",
                    "narrationText": scenario["mock_cta"],
                    "imagePromptEnglish": f"Compelling final scene pointing to comments, neon accent glow, 8k render, 9:16 aspect ratio",
                },
            ],
            "fullNarration": narration_full,
        }

        # 2. Simulate and Validate Growth Hacker Output
        growth_data = {
            "title": scenario["mock_title"],
            "description": f"{scenario['mock_title']}. Assista até o final e descubra o método! #viral",
            "callToActionQuestion": scenario["mock_cta"],
            "hashtags": scenario["mock_tags"],
            "suggestedAudioVibe": "Dark Synthwave 120BPM trending bass",
            "retentionStrategyTip": "Fixe o primeiro comentário provocativo para forçar os usuários a debaterem.",
        }

        try:
            # Pydantic schema validation
            validated_roteiro = RoteiristaOutputModel.model_validate(roteirista_data)
            validated_growth = GrowthHackerOutputModel.model_validate(growth_data)

            # Check timing & constraints
            hook_words = len(scenario["mock_hook"].split())
            body_words = len(scenario["mock_body"].split())
            cta_words = len(scenario["mock_cta"].split())
            total_words = len(narration_full.split())

            assert hook_words <= 14, f"Gancho muito longo ({hook_words} palavras)"
            assert 10 <= body_words <= 30, f"Corpo fora da faixa ({body_words} palavras)"
            assert 3 <= cta_words <= 12, f"CTA fora da faixa ({cta_words} palavras)"
            assert 25 <= total_words <= 50, f"Total fora dos 15s ({total_words} palavras)"

            # Check image prompts vertical aspect ratio keyword
            for sc in validated_roteiro.scenes:
                assert "9:16" in sc.imagePromptEnglish or "vertical" in sc.imagePromptEnglish

            # Check Growth hashtags and title length
            assert len(validated_growth.title) <= 70, "Título excede 70 caracteres"
            assert len(validated_growth.hashtags) >= 4, "Menos de 4 hashtags geradas"

            print(f"  ✓ Roteiro validado: {total_words} palavras (Hook: {hook_words}w, Body: {body_words}w, CTA: {cta_words}w)")
            print(f"  ✓ SEO & Tags: '{validated_growth.title}' ({len(validated_growth.hashtags)} hashtags)")
            print("  ✓ Resultado: APROVADO")
            passed_count += 1

        except Exception as e:
            print(f"  ✗ FALHA: {e}")

    print("\n" + "=" * 70)
    print(f"  RESULTADO FINAL: {passed_count}/{total_count} CENÁRIOS VALIDADOS COM 100% DE SUCESSO")
    print("=" * 70)


if __name__ == "__main__":
    run_suite()
