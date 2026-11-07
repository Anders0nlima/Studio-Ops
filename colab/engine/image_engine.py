"""
StudioOps Media Engine - Image Generation Module (SDXL / Flux.1 Schnell)
Optimized for Google Colab Tesla T4 GPU (15GB VRAM).
Features:
- FP16 precision + VAE tiling to stay strictly below 10GB VRAM.
- 9:16 vertical resolution (768x1344 or 576x1024).
- Automatic negative prompt injection for TikTok-ready quality.
"""

import os
import gc
from pathlib import Path
from typing import List, Optional

DEFAULT_NEGATIVE_PROMPT = (
    "ugly, blurry, low quality, low resolution, bad anatomy, deformed limbs, distorted eyes, "
    "watermark, text, signature, duplicate, cropped, extra fingers, noisy"
)

class ImageEngine:
    def __init__(
        self,
        model_id: str = "stabilityai/sdxl-turbo",
        output_dir: str = "output/images",
        device: str = "auto"
    ):
        self.model_id = model_id
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.pipe = None
        self.device = device

    def load_pipeline(self):
        """
        Loads the Diffusion pipeline with memory optimizations for Colab T4.
        """
        if self.pipe is not None:
            return self.pipe

        try:
            import torch
            from diffusers import AutoPipelineForText2Image

            device_str = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[ImageEngine] Loading model {self.model_id} on {device_str} (FP16)...")

            torch_dtype = torch.float16 if device_str == "cuda" else torch.float32

            self.pipe = AutoPipelineForText2Image.from_pretrained(
                self.model_id,
                torch_dtype=torch_dtype,
                variant="fp16" if device_str == "cuda" else None,
            )

            if device_str == "cuda":
                # Model offloading and VAE tiling ensures VRAM peak <= 8GB on T4
                if hasattr(self.pipe, "enable_model_cpu_offload"):
                    self.pipe.enable_model_cpu_offload()
                else:
                    self.pipe.to("cuda")

                if hasattr(self.pipe, "enable_vae_tiling"):
                    self.pipe.enable_vae_tiling()

            print("[ImageEngine] Pipeline loaded successfully.")
            return self.pipe

        except Exception as e:
            print(f"[ImageEngine Warning] Could not load GPU pipeline ({e}). Running in fallback mode.")
            return None

    def generate_scene_image(
        self,
        prompt: str,
        filename: str,
        width: int = 576,
        height: int = 1024,
        steps: int = 4,
        guidance_scale: float = 0.0
    ) -> Path:
        """
        Generates a single vertical 9:16 frame for a scene.
        """
        output_path = self.output_dir / filename
        pipe = self.load_pipeline()

        if pipe is not None:
            try:
                import torch
                # SDXL Turbo optimal: 1-4 steps, guidance_scale 0.0
                image = pipe(
                    prompt=prompt,
                    negative_prompt=DEFAULT_NEGATIVE_PROMPT,
                    width=width,
                    height=height,
                    num_inference_steps=steps,
                    guidance_scale=guidance_scale,
                ).images[0]

                image.save(output_path)
                self.clear_gpu_memory()
                return output_path
            except Exception as e:
                print(f"[ImageEngine Error] Failed to generate with GPU: {e}. Generating placeholder.")

        # Fallback generator (for local testing/no GPU)
        self._generate_placeholder_image(output_path, prompt, width, height)
        return output_path

    def generate_all_scenes(
        self,
        scenes: List[dict],
        job_id: str
    ) -> List[Path]:
        """
        Generates images for all scenes (Hook, Body, CTA).
        """
        image_paths = []
        for scene in scenes:
            order = scene.get("order", 1)
            prompt = scene.get("prompt") or scene.get("imagePromptEnglish", "Cinematic scene, 9:16")
            filename = f"{job_id}_scene_{order}.png"
            path = self.generate_scene_image(prompt, filename)
            image_paths.append(path)
        return image_paths

    def clear_gpu_memory(self):
        """Cleans up CUDA cache to prevent OOM."""
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                gc.collect()
        except Exception:
            pass

    def _generate_placeholder_image(self, path: Path, label: str, width: int = 576, height: int = 1024):
        """Creates a mock stylized gradient vertical image for testing without GPU."""
        try:
            from PIL import Image, ImageDraw, ImageFont
            img = Image.new("RGB", (width, height), color=(15, 17, 26))
            draw = ImageDraw.Draw(img)

            # Draw glowing cyber grid and label
            draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(0, 229, 245), width=3)
            draw.text((40, height // 2 - 30), "StudioOps AI Generated", fill=(0, 229, 245))
            draw.text((40, height // 2 + 10), label[:50] + "...", fill=(255, 255, 255))
            img.save(path)
        except Exception:
            path.write_bytes(b"MOCK_PNG_IMAGE_STUDIO_OPS")
