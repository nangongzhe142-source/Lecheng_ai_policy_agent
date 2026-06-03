# -*- coding: utf-8 -*-
"""Shared parsing helpers for manual-review queue scripts."""

from __future__ import annotations

import json
import re
from typing import Any

REVIEW_JSON_LINE_REGEX = re.compile(r"REVIEW_JSON=(\{.*\})\s*$", re.DOTALL)
# Dify prompt format: - **是否需要人工复核**：是  (bold wraps label, not value)
REVIEW_FLAG_YES_REGEX = re.compile(
    r"(?:\*{0,2})?是否需要人工复核(?:\*{0,2})?[：:]\s*(?:\*{0,2})?\s*(是|yes|true)\s*(?:\*{0,2})?",
    re.IGNORECASE,
)
REVIEW_FLAG_NO_REGEX = re.compile(
    r"(?:\*{0,2})?是否需要人工复核(?:\*{0,2})?[：:]\s*(?:\*{0,2})?\s*否\s*(?:\*{0,2})?",
)
REVIEW_CATEGORY_REGEX = re.compile(
    r"(?:\*{0,2})?复核类别(?:\*{0,2})?[：:\s]+(?:\*{0,2})?([^\n*]+?)(?:\*{0,2})?(?:\s*$|\s*[-*])",
)
REVIEW_CONFIDENCE_REGEX = re.compile(
    r"(?:\*{0,2})?可信度(?:\*{0,2})?[：:\s]+(?:\*{0,2})?([高中低])(?:\*{0,2})?",
)
REVIEW_REASON_REGEX = re.compile(
    r"(?:\*{0,2})?原因简述(?:\*{0,2})?[：:\s]+(?:\*{0,2})?(.+?)(?:\*{0,2})?(?:\s*$)",
)


def _needs_manual_review(answer: str) -> bool:
    if REVIEW_FLAG_NO_REGEX.search(answer):
        return False
    return bool(REVIEW_FLAG_YES_REGEX.search(answer))


def parse_review_fields(answer: str) -> tuple[bool, str, str, str]:
    if not answer:
        return False, "", "", ""

    json_match = REVIEW_JSON_LINE_REGEX.search(answer)
    if json_match:
        try:
            review_json = json.loads(json_match.group(1))
            need_manual_review = bool(review_json.get("need_manual_review", False))
            category = str(review_json.get("category", "")).strip()
            confidence = str(review_json.get("confidence", "")).strip()
            reason = str(review_json.get("reason", "")).strip()
            return need_manual_review, category, confidence, reason
        except json.JSONDecodeError:
            pass

    need_manual_review = _needs_manual_review(answer)
    category_match = REVIEW_CATEGORY_REGEX.search(answer)
    confidence_match = REVIEW_CONFIDENCE_REGEX.search(answer)
    reason_match = REVIEW_REASON_REGEX.search(answer)

    category = category_match.group(1).strip() if category_match else ""
    confidence = confidence_match.group(1).strip() if confidence_match else ""
    reason = reason_match.group(1).strip() if reason_match else ""
    return need_manual_review, category, confidence, reason


def extract_dify_answer_text(outputs: Any) -> str:
    """
    Dify -> LangSmith outputs shape (verified):
      outputs["choices"]["content"]
    Not text/answer at top level.
    """
    if not isinstance(outputs, dict):
        return ""

    choices = outputs.get("choices")
    if isinstance(choices, dict):
        content = choices.get("content")
        if isinstance(content, str):
            return content

    # Fallbacks for other providers / future shapes
    for key in ("text", "answer", "output", "result"):
        value = outputs.get(key)
        if isinstance(value, str) and value.strip():
            return value

    return ""


def extract_dify_user_query(inputs: Any) -> str:
    if not isinstance(inputs, dict):
        return ""

    messages = inputs.get("messages")
    if not isinstance(messages, list):
        return ""

    user_texts: list[str] = []
    for message in messages:
        if not isinstance(message, dict):
            continue
        if message.get("role") != "user":
            continue
        content = message.get("content")
        if isinstance(content, str) and content.strip():
            user_texts.append(content.strip())

    return user_texts[-1] if user_texts else ""
