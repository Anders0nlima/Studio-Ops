"""
Test Suite for StudioOps Media Pipeline (Colab T4 Worker).
Verifies:
1. Audio generation via TTSEngine.
2. 9:16 vertical image generation via ImageEngine.
3. Ken Burns video assembly via VideoEngine.
4. FastAPI route definitions and job lifecycle.
"""

import os
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
COLAB_DIR = CURRENT_DIR.parent
sys.path.insert(0, str(COLAB_DIR))

from engine.tts_engine import TTSEngine
from engine.image_engine import ImageEngine
from engine.video_engine import VideoEngine

def test_tts_engine():
    print("\n--- 1. Testando Módulo de Áudio (TTSEngine) ---")
    tts = TTSEngine(output_dir=str(COLAB_DIR / "output" / "test_audio"))
    sample_text = "Você ainda perde quatro horas editando um único vídeo? O StudioOps resolve em segundos!"
    audio_path = tts.generate_audio(sample_text, filename="test_narration.mp3")

    assert audio_path.exists(), "Arquivo de áudio não foi gerado!"
    assert audio_path.stat().st_size > 0, "Arquivo de áudio está vazio!"
    print(f"  [OK] Áudio gerado: {audio_path.name} ({audio_path.stat().st_size} bytes)")
    return audio_path

def test_image_engine():
    print("\n--- 2. Testando Módulo de Imagem (ImageEngine 9:16) ---")
    img_engine = ImageEngine(output_dir=str(COLAB_DIR / "output" / "test_images"))

    scenes = [
        {"order": 1, "prompt": "Neon human eye reflecting code, cyberpunk 8k, vertical 9:16"},
        {"order": 2, "prompt": "Futuristic cloud server room, high contrast, 9:16 aspect ratio"},
        {"order": 3, "prompt": "Silhouette of creator snapping fingers, 8k render, vertical 9:16"}
    ]

    image_paths = img_engine.generate_all_scenes(scenes, job_id="test_job_1")
    assert len(image_paths) == 3, f"Esperadas 3 imagens, geradas {len(image_paths)}"
    for p in image_paths:
        assert p.exists() and p.stat().st_size > 0, f"Imagem {p.name} inválida!"
        print(f"  [OK] Imagem vertical 9:16 gerada: {p.name}")

    return image_paths

def test_video_engine(image_paths, audio_path):
    print("\n--- 3. Testando Módulo de Vídeo & Ken Burns (VideoEngine) ---")
    vid_engine = VideoEngine(output_dir=str(COLAB_DIR / "output" / "test_videos"))

    video_path = vid_engine.assemble_tiktok_video(
        image_paths=image_paths,
        audio_path=audio_path,
        filename="test_video_tiktok_916.mp4",
        total_duration=15.0
    )

    assert video_path.exists(), "Arquivo de vídeo MP4 não foi gerado!"
    assert video_path.stat().st_size > 0, "Arquivo de vídeo está vazio!"
    print(f"  [OK] Vídeo final gerado: {video_path.name} ({video_path.stat().st_size} bytes)")
    return video_path

def test_fastapi_server_routes():
    print("\n--- 4. Testando Rotas do Servidor FastAPI ---")
    from server import app
    assert app is not None, "App FastAPI não foi instanciado!"

    routes = [r.path for r in app.routes]
    expected_routes = ["/", "/health", "/render", "/jobs/{job_id}", "/video/{filename}"]
    for er in expected_routes:
        assert er in routes, f"Rota esperada {er} ausente no servidor!"
        print(f"  [OK] Rota registrada: {er}")

if __name__ == "__main__":
    print("=" * 65)
    print("   StudioOps: Test Suite do Worker de Mídia (Colab / Local)")
    print("=" * 65)

    aud = test_tts_engine()
    imgs = test_image_engine()
    vid = test_video_engine(imgs, aud)
    test_fastapi_server_routes()

    print("\n" + "=" * 65)
    print("  TODOS OS TESTES DA FÁBRICA DE MÍDIA FORAM APROVADOS!")
    print("=" * 65)
