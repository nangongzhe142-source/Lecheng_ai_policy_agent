#!/usr/bin/env python3
"""Inspect LangSmith run outputs structure for Lecheng policy agent project."""

from __future__ import annotations

import json
import os
import sys
from typing import Any

from langsmith import Client

PROJECT_NAME = os.getenv("LANGSMITH_PROJECT", "Lecheng_policy_ai_agent")


def dump_run(label: str, run: Any) -> None:
    outputs = run.outputs
    print(f"\n{'=' * 60}")
    print(f"[{label}] name={run.name!r} run_id={run.id}")
    print(f"run_type={getattr(run, 'run_type', None)}")
    print(f"outputs type: {type(outputs)}")
    if outputs:
        if isinstance(outputs, dict):
            print(f"outputs keys: {list(outputs.keys())}")
        print("outputs JSON:")
        print(json.dumps(outputs, indent=2, ensure_ascii=False, default=str))
    else:
        print("outputs: (empty)")
    inputs = getattr(run, "inputs", None)
    if inputs and isinstance(inputs, dict):
        print(f"inputs keys: {list(inputs.keys())}")


def main() -> int:
    if not os.getenv("LANGSMITH_API_KEY"):
        print("[ERROR] Set LANGSMITH_API_KEY environment variable.", file=sys.stderr)
        return 1

    client = Client()
    print(f"Project: {PROJECT_NAME}")

    # Root runs
    root_runs = list(client.list_runs(project_name=PROJECT_NAME, is_root=True, limit=5))
    if not root_runs:
        print("[ERROR] No root runs found. Trigger the Dify agent first.")
        return 1

    print(f"Found {len(root_runs)} recent root run(s).")
    dump_run("root[0]", root_runs[0])

    # Named run types (message, llm, dataset_retrieval)
    for run_name in ("message", "llm", "dataset_retrieval"):
        typed = list(
            client.list_runs(
                project_name=PROJECT_NAME,
                filter=f'eq(name, "{run_name}")',
                limit=3,
            )
        )
        if typed:
            dump_run(f"name={run_name}[0]", typed[0])
        else:
            print(f"\n[{run_name}] no runs found with this name")

    # Find a run whose outputs contain manual review flag
    print("\n" + "=" * 60)
    print("Scanning for 是否需要人工复核 in recent llm/message outputs...")
    candidates = list(
        client.list_runs(
            project_name=PROJECT_NAME,
            filter='or(eq(name, "llm"), eq(name, "message"))',
            limit=50,
        )
    )
    hit = None
    for run in candidates:
        text = json.dumps(run.outputs or {}, ensure_ascii=False)
        if "是否需要人工复核" in text or "need_manual_review" in text:
            hit = run
            break

    if hit:
        dump_run("manual_review_hit", hit)
    else:
        print("No run in last 50 llm/message with 是否需要人工复核 in outputs.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
