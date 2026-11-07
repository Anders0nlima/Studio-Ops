"""
StudioOps Media Server - FastAPI Worker with Async Queue & Ngrok Tunnel
Designed to run on Google Colab GPU T4.
Endpoints:
- POST /render: Initiates async video rendering.
- GET /jobs/{id}: Checks rendering status and gets download link.
- GET /video/{filename}: Streams the generated MP4.
- GET /health: Reports GPU VRAM metrics.
"""

import os
import sys
import uuid
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

# Add current path
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

from engine.tts_engine import TTSEngine
from engine.image_engine import ImageEngine
from engine.video_engine import VideoEngine

# Directories
BASE_OUTPUT_DIR = CURRENT_DIR / "output"
VIDEO_DIR = BASE_OUTPUT_DIR / "videos"
AUDIO_DIR = BASE_OUTPUT_DIR / "audio"
IMAGE_DIR = BASE_OUTPUT_DIR / "images"

for d in [VIDEO_DIR, AUDIO_DIR, IMAGE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# In-memory Job Store
JOBS: Dict[str, Dict[str, Any]] = {}

# Initialize engines
tts_engine = TTSEngine(output_dir=str(AUDIO_DIR))
image_engine = ImageEngine(output_dir=str(IMAGE_DIR))
video_engine = VideoEngine(output_dir=str(VIDEO_DIR))


class SceneInput(BaseModel):
    order: int
    timeRange: Optional[str] = "0-3s"
    narration: Optional[str] = ""
    prompt: Optional[str] = "Cinematic scene, vertical 9:16"


class RenderRequest(BaseModel):
    jobId: Optional[str] = None
    topic: str
    style: str = "Cyberpunk"
    voice: str = "pt-BR-FranciscaNeural"
    duration: str = "15s"
    narration: str = ""
    scenes: List[SceneInput]
    callbackWebhook: Optional[str] = None


async def process_video_job(job_id: str, req: RenderRequest, base_url: str):
    """
    Background worker executing the complete audio, image, and video assembly pipeline.
    """
    try:
        # Step 1: Text-to-Speech
        JOBS[job_id]["status"] = "generating_audio"
        JOBS[job_id]["progress"] = 20
        JOBS[job_id]["statusMessage"] = "Sintetizando áudio neural com Edge-TTS..."

        narration_text = req.narration
        if not narration_text:
            narration_text = " ".join([s.narration for s in req.scenes if s.narration])

        audio_filename = f"{job_id}_audio.mp3"
        audio_path = await tts_engine.generate_audio_async(
            text=narration_text,
            filename=audio_filename,
            voice=req.voice
        )

        # Step 2: Image Generation
        JOBS[job_id]["status"] = "generating_images"
        JOBS[job_id]["progress"] = 50
        JOBS[job_id]["statusMessage"] = "Gerando 3 cenas verticais (SDXL 9:16)..."

        scene_dicts = [s.model_dump() for s in req.scenes]
        image_paths = image_engine.generate_all_scenes(scene_dicts, job_id)

        # Step 3: Video Assembly & Ken Burns
        JOBS[job_id]["status"] = "rendering_video"
        JOBS[job_id]["progress"] = 80
        JOBS[job_id]["statusMessage"] = "Montando vídeo TikTok com efeito Ken Burns (MoviePy)..."

        video_filename = f"{job_id}_tiktok_916.mp4"
        video_path = video_engine.assemble_tiktok_video(
            image_paths=image_paths,
            audio_path=audio_path,
            filename=video_filename,
            total_duration=15.0
        )

        # Step 4: Completion
        video_url = f"{base_url}/video/{video_filename}"
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["statusMessage"] = "Vídeo 1080x1920 pronto para publicação no TikTok!"
        JOBS[job_id]["videoUrl"] = video_url
        JOBS[job_id]["videoPath"] = str(video_path)

        # Step 5: Webhook callback (if requested)
        if req.callbackWebhook:
            try:
                import urllib.request
                import json
                cb_data = json.dumps({
                    "jobId": job_id,
                    "status": "completed",
                    "videoUrl": video_url
                }).encode("utf-8")
                cb_req = urllib.request.Request(
                    req.callbackWebhook,
                    data=cb_data,
                    headers={"Content-Type": "application/json"}
                )
                urllib.request.urlopen(cb_req, timeout=5)
            except Exception as cb_err:
                print(f"[Callback Warning] Could not notify webhook: {cb_err}")

    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["statusMessage"] = f"Erro na renderização: {e}"


def create_app():
    try:
        from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import FileResponse, JSONResponse
    except ImportError:
        return None

    app = FastAPI(
        title="StudioOps Media Worker",
        description="GPU T4 Media Generator (Edge-TTS, SDXL, MoviePy)",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def root():
        return {
            "name": "StudioOps Media Engine",
            "version": "1.0.0",
            "docs": "/docs",
            "endpoints": ["POST /render", "GET /jobs/{id}", "GET /video/{filename}", "GET /health"]
        }

    @app.get("/health")
    def health():
        gpu_info = {"available": False, "device": "CPU"}
        try:
            import torch
            if torch.cuda.is_available():
                gpu_info = {
                    "available": True,
                    "device": torch.cuda.get_device_name(0),
                    "memory_allocated_mb": round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2),
                    "memory_reserved_mb": round(torch.cuda.memory_reserved(0) / (1024 * 1024), 2),
                    "total_memory_mb": round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 2),
                }
        except Exception:
            pass

        return {"status": "ok", "gpu": gpu_info, "active_jobs": len(JOBS)}

    @app.post("/render")
    async def render_video(req: RenderRequest, background_tasks: BackgroundTasks, request: Request):
        job_id = req.jobId or f"job_{uuid.uuid4().hex[:8]}"
        base_url = str(request.base_url).rstrip("/")

        JOBS[job_id] = {
            "jobId": job_id,
            "status": "queued",
            "progress": 5,
            "statusMessage": "Job recebido na fila do Colab...",
            "topic": req.topic,
            "style": req.style,
            "videoUrl": None
        }

        background_tasks.add_task(process_video_job, job_id, req, base_url)

        return {
            "success": True,
            "job_id": job_id,
            "status": "queued",
            "message": "Renderização iniciada na GPU T4.",
            "status_url": f"{base_url}/jobs/{job_id}"
        }

    @app.get("/jobs/{job_id}")
    def get_job(job_id: str):
        if job_id not in JOBS:
            raise HTTPException(status_code=404, detail="Job não encontrado")
        return JOBS[job_id]

    @app.get("/video/{filename}")
    def get_video(filename: str):
        video_file = VIDEO_DIR / filename
        if not video_file.exists():
            raise HTTPException(status_code=404, detail="Arquivo de vídeo não encontrado")
        return FileResponse(str(video_file), media_type="video/mp4")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
