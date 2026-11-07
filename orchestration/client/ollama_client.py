"""
Ollama Client with Native JSON Mode and Pydantic Schema Validation.
Connects to local Ollama instance (default: http://localhost:11434).
"""

import json
import re
import urllib.request
import urllib.error
from typing import Optional, Type, TypeVar
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)

class OllamaClient:
    def __init__(self, host: str = "http://127.0.0.1:11434", default_model: str = "llama3:8b"):
        self.host = host.rstrip("/")
        self.default_model = default_model

    def is_online(self) -> bool:
        """Checks if the local Ollama daemon is responding."""
        try:
            req = urllib.request.Request(f"{self.host}/api/tags", headers={"User-Agent": "StudioOps/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                return resp.status == 200
        except Exception:
            return False

    def list_models(self) -> list[str]:
        """Returns list of downloaded models in Ollama."""
        try:
            req = urllib.request.Request(f"{self.host}/api/tags", headers={"User-Agent": "StudioOps/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return [m.get("name") for m in data.get("models", [])]
        except Exception:
            return []

    def clean_json_markdown(self, raw_text: str) -> str:
        """Strips accidental markdown code blocks from LLM output."""
        cleaned = raw_text.strip()
        # Remove ```json and ```
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
        return cleaned.strip()

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        pydantic_model: Optional[Type[T]] = None,
    ) -> tuple[dict, Optional[T]]:
        """
        Sends request to Ollama /api/generate with format='json'.
        Validates against pydantic_model if supplied.
        """
        model_name = model or self.default_model
        payload = {
            "model": model_name,
            "system": system_prompt,
            "prompt": user_prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.host}/api/generate",
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=60) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            raw_response = resp_data.get("response", "{}")
            cleaned_json_str = self.clean_json_markdown(raw_response)
            parsed_dict = json.loads(cleaned_json_str)

            validated_instance = None
            if pydantic_model:
                validated_instance = pydantic_model.model_validate(parsed_dict)

            return parsed_dict, validated_instance
