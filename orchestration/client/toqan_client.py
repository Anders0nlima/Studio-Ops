"""
Toqan (iFood Enterprise AI Gateway) Adapter Client.
Complies with OpenAI-compatible chat completion specification while mapping
strictly to StudioOps Pydantic models.
"""

import os
import json
import re
import urllib.request
import urllib.error
from typing import Optional, Type, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class ToqanError(Exception):
    """Base exception for Toqan gateway interactions."""
    pass


class ToqanAuthError(ToqanError):
    """Raised when Toqan authentication fails (401/403)."""
    pass


class ToqanConnectionError(ToqanError):
    """Raised when Toqan gateway is unreachable (VPN offline or DNS failure)."""
    pass


class ToqanClient:
    """
    Client for interacting with iFood's internal GenAI Gateway (Toqan).
    Conforms to OpenAI /v1/chat/completions format.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        default_model: Optional[str] = None,
        timeout: int = 45,
    ):
        raw_url = base_url or os.getenv(
            "TOQAN_API_URL",
            "https://toqan-gateway.internal.ifood.com.br/v1"
        )
        # Normalize endpoint URL
        self.base_url = raw_url.rstrip("/")
        if self.base_url.endswith("/chat/completions"):
            self.endpoint = self.base_url
        else:
            self.endpoint = f"{self.base_url}/chat/completions"

        self.api_key = api_key or os.getenv("TOQAN_API_KEY", "")
        self.default_model = default_model or os.getenv("TOQAN_MODEL", "claude-3-5-sonnet")
        self.timeout = timeout

    def is_online(self) -> bool:
        """
        Quick health check against Toqan gateway.
        Checks if the base endpoint responds or is reachable.
        """
        try:
            # Check models list or base url
            health_url = self.base_url.replace("/chat/completions", "")
            if not health_url.endswith("/models"):
                health_url = f"{health_url}/models"

            headers = {
                "User-Agent": "StudioOps-ToqanAdapter/1.0",
            }
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            req = urllib.request.Request(health_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=3) as resp:
                return resp.status in (200, 204)
        except urllib.error.HTTPError as e:
            # 401/403 means host is online but requires valid key
            if e.code in (401, 403):
                return True
            return False
        except Exception:
            return False

    def clean_json_markdown(self, raw_text: str) -> str:
        """Strips accidental markdown code fences from LLM output."""
        cleaned = raw_text.strip()
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
        Sends chat completion request to Toqan gateway in OpenAI-compatible format.
        Extracts content, cleans JSON, and validates against pydantic_model.
        """
        model_name = model or self.default_model

        payload: dict[str, Any] = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": temperature,
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "StudioOps-ToqanAdapter/1.0",
            "X-Requester-App": "StudioOps",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        req = urllib.request.Request(
            self.endpoint,
            data=data_bytes,
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = ""
            try:
                err_body = e.read().decode("utf-8")
            except Exception:
                pass

            if e.code in (401, 403):
                raise ToqanAuthError(
                    f"Toqan authentication failed ({e.code}): Check TOQAN_API_KEY. Details: {err_body}"
                ) from e
            raise ToqanError(f"Toqan Gateway returned HTTP {e.code}: {err_body}") from e
        except urllib.error.URLError as e:
            raise ToqanConnectionError(
                f"Failed to connect to Toqan Gateway at {self.endpoint}. Is VPN connected? Reason: {e.reason}"
            ) from e

        # Extract content from OpenAI-compatible response
        raw_content = ""
        if "choices" in resp_data and len(resp_data["choices"]) > 0:
            choice = resp_data["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                raw_content = choice["message"]["content"]
            elif "text" in choice:
                raw_content = choice["text"]
        elif "response" in resp_data:
            raw_content = resp_data["response"]
        elif "content" in resp_data:
            raw_content = resp_data["content"]
        else:
            raw_content = json.dumps(resp_data)

        cleaned_json_str = self.clean_json_markdown(raw_content)
        parsed_dict = json.loads(cleaned_json_str)

        validated_instance = None
        if pydantic_model:
            validated_instance = pydantic_model.model_validate(parsed_dict)

        return parsed_dict, validated_instance
