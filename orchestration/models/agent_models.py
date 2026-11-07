"""
Pydantic Models & Data Validators for StudioOps Agents.
Ensures strict validation of LLM outputs against TikTok 15s retention rules.
"""

from typing import List, Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class TrendItemModel(BaseModel):
    id: str
    tag: str = Field(..., description="Hashtag starting with #")
    topic: str
    growth: str
    color: Literal["cyan", "pink", "purple", "amber"]
    insight: str
    visualStyleRecommended: str
    retentionScore: float = Field(..., ge=0, le=100)
    hookIdea: str

    @field_validator("tag")
    @classmethod
    def validate_tag(cls, v: str) -> str:
        if not v.startswith("#"):
            return f"#{v.strip()}"
        return v.strip()


class CoolhunterOutputModel(BaseModel):
    trends: List[TrendItemModel] = Field(..., min_length=1)


class ScriptSceneModel(BaseModel):
    order: int
    type: Literal["hook", "body", "cta"]
    timeRange: str
    narrationText: str
    imagePromptEnglish: str

    @field_validator("imagePromptEnglish")
    @classmethod
    def validate_image_prompt(cls, v: str) -> str:
        v_lower = v.lower()
        if "9:16" not in v_lower and "vertical" not in v_lower:
            # Enforce 9:16 aspect ratio keyword if omitted by LLM
            return f"{v.strip()}, vertical 9:16 aspect ratio"
        return v.strip()


class RoteiristaOutputModel(BaseModel):
    topic: str
    style: str
    targetDuration: str = "15s"
    totalWordCount: int
    scenes: List[ScriptSceneModel] = Field(..., min_length=3, max_length=3)
    fullNarration: str

    @model_validator(mode="after")
    def validate_timing_and_scenes(self) -> "RoteiristaOutputModel":
        scenes_by_type = {s.type: s for s in self.scenes}
        if "hook" not in scenes_by_type or "body" not in scenes_by_type or "cta" not in scenes_by_type:
            raise ValueError("O roteiro deve conter exatamente 3 cenas: hook, body e cta.")

        hook_words = len(scenes_by_type["hook"].narrationText.split())
        body_words = len(scenes_by_type["body"].narrationText.split())
        cta_words = len(scenes_by_type["cta"].narrationText.split())
        total = len(self.fullNarration.split())

        # Update totalWordCount if inconsistent
        self.totalWordCount = total

        if hook_words > 16:
            raise ValueError(f"O gancho (0-3s) tem {hook_words} palavras. O limite máximo é 16 palavras para prender nos primeiros 3s.")
        if total > 55:
            raise ValueError(f"O roteiro tem {total} palavras, o que ultrapassa 15 segundos em velocidade de fala natural (máx 55 palavras).")

        return self


class GrowthHackerOutputModel(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    callToActionQuestion: str
    hashtags: List[str] = Field(..., min_length=4, max_length=12)
    suggestedAudioVibe: str
    retentionStrategyTip: str

    @field_validator("hashtags")
    @classmethod
    def clean_hashtags(cls, tags: List[str]) -> List[str]:
        cleaned = []
        for t in tags:
            tag = t.strip()
            if not tag.startswith("#"):
                tag = f"#{tag}"
            cleaned.append(tag)
        return cleaned


class PerformanceTipModel(BaseModel):
    id: str
    category: str
    text: str


class PerformanceAnalyzerOutputModel(BaseModel):
    summary: str
    averageWatchTime: str
    completionRate: str
    dropoffAt2s: str
    overallScore: float = Field(..., ge=0, le=100)
    diagnosis: str
    actionableTips: List[PerformanceTipModel] = Field(..., min_length=1)
