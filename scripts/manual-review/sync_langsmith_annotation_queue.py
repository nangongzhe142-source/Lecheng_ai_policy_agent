#!/usr/bin/env python3
"""
Scan LangSmith project runs that need manual review and push them to an Annotation Queue.

Dify -> LangSmith verified output path:
  run.outputs["choices"]["content"]

Requires LANGSMITH_API_KEY in environment (never hardcode in this file).
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any

from langsmith import Client

from review_common import extract_dify_answer_text, extract_dify_user_query, parse_review_fields

DEFAULT_PROJECT = "Lecheng_policy_ai_agent"


def load_queue_run_ids(client: Client, queue_id: str, prefetch_limit: int) -> set[str]:
    """Prefetch run IDs already in the annotation queue for idempotent skips."""
    existing: set[str] = set()
    try:
        for item in client.list_runs_from_annotation_queue(queue_id=queue_id, limit=prefetch_limit):
            run_id = getattr(item, "id", None) or getattr(item, "run_id", None)
            if run_id:
                existing.add(str(run_id))
    except Exception as error:
        print(f"[WARN] Could not prefetch queue runs: {error}", file=sys.stderr)
    return existing


def iter_candidate_runs(
    client: Client,
    *,
    project_name: str,
    run_name: str | None,
    root_only: bool,
    start_time: datetime | None,
    limit: int,
) -> list[Any]:
    kwargs: dict[str, Any] = {
        "project_name": project_name,
        "limit": limit,
    }
    if start_time:
        kwargs["start_time"] = start_time
    if root_only:
        kwargs["is_root"] = True
    elif run_name:
        kwargs["filter"] = f'eq(name, "{run_name}")'

    return list(client.list_runs(**kwargs))


def is_duplicate_error(error: Exception) -> bool:
    message = str(error).lower()
    return "already exists" in message or "duplicate" in message or "409" in message


def enqueue_run(client: Client, queue_id: str, run_id: str) -> None:
    client.add_runs_to_annotation_queue(queue_id=queue_id, run_ids=[run_id])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Push LangSmith runs with 是否需要人工复核=是 into an Annotation Queue.",
    )
    parser.add_argument(
        "--project",
        default=os.getenv("LANGSMITH_PROJECT", DEFAULT_PROJECT),
        help="LangSmith project name (default: LANGSMITH_PROJECT env or Lecheng_policy_ai_agent)",
    )
    parser.add_argument("--queue-id", required=True, help="Annotation Queue UUID from LangSmith URL")
    parser.add_argument(
        "--run-name",
        default="llm",
        help='Scan runs with this name (default: "llm"). Ignored if --root-only is set.',
    )
    parser.add_argument(
        "--root-only",
        action="store_true",
        help="Scan root runs only (may duplicate message+llm; prefer --run-name llm)",
    )
    parser.add_argument("--hours", type=int, default=24, help="Only runs within last N hours (0 = no filter)")
    parser.add_argument(
        "--limit",
        type=int,
        default=100,
        help="Max runs to scan (LangSmith API max per request is 100)",
    )
    parser.add_argument(
        "--queue-prefetch-limit",
        type=int,
        default=2000,
        help="Max existing queue runs to load for deduplication",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print matches without adding to annotation queue",
    )
    return parser.parse_args()


def main() -> int:
    if not os.getenv("LANGSMITH_API_KEY"):
        print("[ERROR] Set LANGSMITH_API_KEY in environment.", file=sys.stderr)
        return 1

    args = parse_args()
    client = Client()

    start_time = None
    if args.hours > 0:
        start_time = datetime.now(timezone.utc) - timedelta(hours=args.hours)

    print(f"[INFO] project={args.project} queue_id={args.queue_id}")
    print(f"[INFO] scan: {'root_only' if args.root_only else f'name={args.run_name}'} limit={args.limit} hours={args.hours}")

    existing_in_queue = set()
    if not args.dry_run:
        existing_in_queue = load_queue_run_ids(client, args.queue_id, args.queue_prefetch_limit)
        print(f"[INFO] Existing runs in queue (prefetched): {len(existing_in_queue)}")

    runs = iter_candidate_runs(
        client,
        project_name=args.project,
        run_name=args.run_name if not args.root_only else None,
        root_only=args.root_only,
        start_time=start_time,
        limit=args.limit,
    )
    print(f"[INFO] Scanned runs: {len(runs)}")

    matched = 0
    enqueued = 0
    skipped_in_queue = 0
    failed = 0

    for run in runs:
        answer = extract_dify_answer_text(run.outputs)
        need_review, category, confidence, reason = parse_review_fields(answer)
        if not need_review:
            continue

        matched += 1
        query = extract_dify_user_query(run.inputs)
        start = getattr(run, "start_time", None)
        start_str = start.isoformat() if hasattr(start, "isoformat") else str(start or "")

        print(
            f"[MATCH] run_id={run.id} name={getattr(run, 'name', '')} "
            f"start={start_str} category={category} confidence={confidence}"
        )
        if query:
            preview = query[:80] + ("..." if len(query) > 80 else "")
            print(f"        query={preview}")
        if reason:
            preview = reason[:120] + ("..." if len(reason) > 120 else "")
            print(f"        reason={preview}")

        if args.dry_run:
            continue

        if str(run.id) in existing_in_queue:
            skipped_in_queue += 1
            print(f"[SKIP] Already in queue: {run.id}")
            continue

        try:
            enqueue_run(client, args.queue_id, str(run.id))
            enqueued += 1
            existing_in_queue.add(str(run.id))
            print(f"[OK] Added to annotation queue: {run.id}")
        except Exception as error:
            if is_duplicate_error(error):
                skipped_in_queue += 1
                existing_in_queue.add(str(run.id))
                print(f"[SKIP] Already in queue (API): {run.id}")
            else:
                failed += 1
                print(f"[FAIL] run_id={run.id} error={error}", file=sys.stderr)

    print(
        f"[DONE] matched={matched} enqueued={enqueued} "
        f"skipped_in_queue={skipped_in_queue} failed={failed} dry_run={args.dry_run}"
    )
    return 2 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
