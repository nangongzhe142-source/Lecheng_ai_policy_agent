#!/usr/bin/env python3
"""
Pull Dify traces from LangSmith and collect runs that need manual review.

Verified LangSmith structure for project Lecheng_policy_ai_agent:
  - Run names: dataset_retrieval | message | llm
  - Answer text: run.outputs["choices"]["content"]  (NOT text/answer)
  - User query: last inputs["messages"][role=user].content
  - Prefer scanning run name == "llm" to avoid duplicate message+llm pairs
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from langsmith import Client

from review_common import extract_dify_answer_text, extract_dify_user_query, parse_review_fields

DEFAULT_PROJECT = "Lecheng_policy_ai_agent"


@dataclass
class QueueRow:
    message_id: str
    conversation_id: str
    trace_id: str
    langsmith_run_id: str
    query: str
    audience: str
    need_manual_review: bool
    review_category: str
    confidence: str
    reason: str
    source: str
    ingress: str
    status: str
    run_name: str
    created_at: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "message_id": self.message_id,
            "conversation_id": self.conversation_id,
            "trace_id": self.trace_id,
            "langsmith_run_id": self.langsmith_run_id,
            "query": self.query,
            "audience": self.audience,
            "need_manual_review": self.need_manual_review,
            "review_category": self.review_category,
            "confidence": self.confidence,
            "reason": self.reason,
            "source": self.source,
            "ingress": self.ingress,
            "status": self.status,
            "run_name": self.run_name,
            "created_at": self.created_at,
        }


def write_csv(path: Path, rows: list[QueueRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = list(rows[0].to_dict().keys()) if rows else [
        "message_id",
        "conversation_id",
        "trace_id",
        "langsmith_run_id",
        "query",
        "audience",
        "need_manual_review",
        "review_category",
        "confidence",
        "reason",
        "source",
        "ingress",
        "status",
        "run_name",
        "created_at",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.to_dict())


def post_rows(queue_api_url: str, queue_api_token: str | None, rows: list[QueueRow], timeout: float) -> tuple[int, int]:
    success = 0
    failed = 0
    for row in rows:
        payload = {
            "message_id": row.message_id,
            "conversation_id": row.conversation_id,
            "query": row.query,
            "audience": row.audience,
            "need_manual_review": row.need_manual_review,
            "review_category": row.review_category,
            "confidence": row.confidence,
            "reason": row.reason,
            "source": row.source,
            "ingress": row.ingress,
            "status": row.status,
        }
        body = __import__("json").dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if queue_api_token:
            headers["Authorization"] = f"Bearer {queue_api_token}"

        request = urllib.request.Request(queue_api_url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                if 200 <= response.status < 300:
                    success += 1
                else:
                    failed += 1
        except urllib.error.URLError:
            failed += 1
    return success, failed


def run_to_row(run: Any, source: str, ingress: str) -> QueueRow | None:
    answer = extract_dify_answer_text(run.outputs)
    need_review, category, confidence, reason = parse_review_fields(answer)
    if not need_review:
        return None

    query = extract_dify_user_query(run.inputs)
    session_id = str(getattr(run, "session_id", "") or "")
    trace_id = str(getattr(run, "trace_id", "") or run.id)
    conversation_id = session_id or trace_id

    created = getattr(run, "start_time", None) or getattr(run, "created_at", None)
    created_at = created.isoformat() if hasattr(created, "isoformat") else str(created or "")

    # Use llm run id as message_id; prefix avoids collision with Dify DB ids
    message_id = f"ls_{run.id}"

    return QueueRow(
        message_id=message_id,
        conversation_id=conversation_id,
        trace_id=trace_id,
        langsmith_run_id=str(run.id),
        query=query,
        audience="",
        need_manual_review=True,
        review_category=category,
        confidence=confidence,
        reason=reason,
        source=source,
        ingress=ingress,
        status="pending",
        run_name=str(getattr(run, "name", "")),
        created_at=created_at,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync manual-review runs from LangSmith project.")
    parser.add_argument("--project", default=os.getenv("LANGSMITH_PROJECT", DEFAULT_PROJECT))
    parser.add_argument("--run-name", default="llm", help='Scan this run name only (default: "llm")')
    parser.add_argument("--limit", type=int, default=200, help="Max runs to scan")
    parser.add_argument("--hours", type=int, default=0, help="Only runs within last N hours (0 = no filter)")
    parser.add_argument("--output-csv", required=True, help="Output CSV path")
    parser.add_argument("--source", default="langsmith_eval")
    parser.add_argument("--ingress", default="langsmith_sync")
    parser.add_argument("--queue-api-url", default="")
    parser.add_argument("--queue-api-token", default="")
    parser.add_argument("--timeout-seconds", type=float, default=5.0)
    return parser.parse_args()


def main() -> int:
    if not os.getenv("LANGSMITH_API_KEY"):
        print("[ERROR] Set LANGSMITH_API_KEY in environment.", file=sys.stderr)
        return 1

    args = parse_args()
    client = Client()
    output_csv = Path(args.output_csv).expanduser().resolve()

    filter_expr = f'eq(name, "{args.run_name}")'
    kwargs: dict[str, Any] = {
        "project_name": args.project,
        "filter": filter_expr,
        "limit": args.limit,
    }
    if args.hours > 0:
        start_time = datetime.now(timezone.utc) - timedelta(hours=args.hours)
        kwargs["start_time"] = start_time

    runs = list(client.list_runs(**kwargs))
    print(f"[INFO] Scanned runs: {len(runs)} (project={args.project}, name={args.run_name})")

    dedup: dict[str, QueueRow] = {}
    for run in runs:
        row = run_to_row(run, source=args.source, ingress=args.ingress)
        if row:
            dedup[row.message_id] = row

    rows = list(dedup.values())
    write_csv(output_csv, rows)
    print(f"[INFO] Need manual review: {len(rows)}")
    print(f"[INFO] CSV: {output_csv}")

    if args.queue_api_url and rows:
        ok, fail = post_rows(
            args.queue_api_url.strip(),
            args.queue_api_token.strip() or None,
            rows,
            args.timeout_seconds,
        )
        print(f"[INFO] Queue POST success={ok}, failed={fail}")
        if fail:
            return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
