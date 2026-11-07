"""
AI Client Factory & Resilience Provider for StudioOps.
Dynamically routes between local Ollama (0-cost offline) and enterprise Toqan (iFood Gateway).
"""

import os
import logging
from typing import Optional, Union, Type, TypeVar
from pydantic import BaseModel

from .ollama_client import OllamaClient
from .toqan_client import ToqanClient, ToqanError, ToqanConnectionError, ToqanAuthError

logger = logging.getLogger("StudioOps.AIFactory")
T = TypeVar("T", bound=BaseModel)


class ResilientAIClient:
    """
    Unified client wrapper that delegates to Toqan or Ollama based on AI_PROVIDER.
    Supports seamless automatic fallback to local Ollama if Toqan is unreachable (e.g. VPN drop).
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        enable_fallback: bool = True,
    ):
        self.provider = (provider or os.getenv("AI_PROVIDER", "ollama")).strip().lower()
        self.enable_fallback = enable_fallback
        self.ollama = OllamaClient(
            host=os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434"),
            default_model=os.getenv("OLLAMA_MODEL", "llama3.2:3b"),
        )
        self.toqan = ToqanClient(
            base_url=os.getenv("TOQAN_API_URL"),
            api_key=os.getenv("TOQAN_API_KEY"),
            default_model=os.getenv("TOQAN_MODEL", "claude-3-5-sonnet"),
        )

    def is_online(self) -> bool:
        """Returns True if the active provider is responsive."""
        if self.provider == "toqan":
            return self.toqan.is_online()
        return self.ollama.is_online()

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        pydantic_model: Optional[Type[T]] = None,
    ) -> tuple[dict, Optional[T]]:
        """
        Executes generation on the configured provider with automatic fallback if enabled.
        """
        if self.provider == "toqan":
            try:
                return self.toqan.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    model=model,
                    temperature=temperature,
                    pydantic_model=pydantic_model,
                )
            except (ToqanConnectionError, ToqanAuthError, ToqanError) as e:
                if self.enable_fallback:
                    logger.warning(
                        f"[Toqan Fallback Triggered] Provider 'toqan' failed: {e}. Falling back to local Ollama..."
                    )
                    return self.ollama.generate(
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        model=None,
                        temperature=temperature,
                        pydantic_model=pydantic_model,
                    )
                raise

        # Default Ollama provider
        return self.ollama.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            pydantic_model=pydantic_model,
        )


def get_ai_client(
    provider: Optional[str] = None,
    enable_fallback: bool = True,
) -> Union[OllamaClient, ToqanClient, ResilientAIClient]:
    """
    Factory function returning a ResilientAIClient configured by AI_PROVIDER.
    """
    return ResilientAIClient(provider=provider, enable_fallback=enable_fallback)
