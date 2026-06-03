#!/usr/bin/env python3
"""
Reconcile manual review records between:
1) Realtime queue export (ingress=webhook)
2) Batch filtered export (ingress=export_reconcile)

Output one CSV with action tags:
  - missing_in_realtime  (present in batch, absent in realtime)
  - extra_in_realtime    (present in realtime, absent in batch)
  - consistent           (present in both)
"""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from pathlib import Path


@dataclass
class RowData:
    message_id: str
    conversation_id: str
    query: str
    audience: str
    review_category: str
    confidence: str
    reason: str
    source: str
    ingress: str
    status: str

    @classmethod
    def from_csv_row(cls, row: dict[str, str]) -> "RowData":
        return cls(
            message_id=(row.get("message_id") or "").strip(),
            conversation_id=(row.get("conversation_id") or "").strip(),
            query=(row.get("query") or "").strip(),
            audience=(row.get("audience") or "").strip(),
            review_category=(row.get("review_category") or "").strip(),
            confidence=(row.get("confidence") or "").strip(),
            reason=(row.get("reason") or "").strip(),
            source=(row.get("source") or "").strip(),
            ingress=(row.get("ingress") or "").strip(),
            status=(row.get("status") or "").strip(),
        )

    def to_output_dict(self, action: str, in_realtime: bool, in_batch: bool) -> dict[str, str]:
        return {
            "message_id": self.message_id,
            "conversation_id": self.conversation_id,
            "query": self.query,
            "audience": self.audience,
            "review_category": self.review_category,
            "confidence": self.confidence,
            "reason": self.reason,
            "source": self.source,
            "ingress": self.ingress,
            "status": self.status,
            "in_realtime": str(in_realtime),
            "in_batch": str(in_batch),
            "action": action,
        }


def read_csv_by_message_id(path: Path) -> dict[str, RowData]:
    indexed_rows: dict[str, RowData] = {}
    with path.open(mode="r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            row_data = RowData.from_csv_row(row)
            if not row_data.message_id:
                continue
            indexed_rows[row_data.message_id] = row_data
    return indexed_rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reconcile realtime queue records and batch filtered records.")
    parser.add_argument("--realtime-csv", required=True, help="Realtime queue csv path")
    parser.add_argument("--batch-csv", required=True, help="Batch filtered csv path")
    parser.add_argument("--output-csv", required=True, help="Output reconcile csv path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    realtime_csv = Path(args.realtime_csv).expanduser().resolve()
    batch_csv = Path(args.batch_csv).expanduser().resolve()
    output_csv = Path(args.output_csv).expanduser().resolve()

    if not realtime_csv.exists():
        raise FileNotFoundError(f"Realtime csv not found: {realtime_csv}")
    if not batch_csv.exists():
        raise FileNotFoundError(f"Batch csv not found: {batch_csv}")

    realtime_rows = read_csv_by_message_id(realtime_csv)
    batch_rows = read_csv_by_message_id(batch_csv)

    realtime_ids = set(realtime_rows.keys())
    batch_ids = set(batch_rows.keys())

    missing_in_realtime = sorted(batch_ids - realtime_ids)
    extra_in_realtime = sorted(realtime_ids - batch_ids)
    consistent_ids = sorted(realtime_ids & batch_ids)

    output_csv.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "message_id",
        "conversation_id",
        "query",
        "audience",
        "review_category",
        "confidence",
        "reason",
        "source",
        "ingress",
        "status",
        "in_realtime",
        "in_batch",
        "action",
    ]
    with output_csv.open(mode="w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()

        for message_id in missing_in_realtime:
            row = batch_rows[message_id]
            writer.writerow(row.to_output_dict(action="missing_in_realtime", in_realtime=False, in_batch=True))

        for message_id in extra_in_realtime:
            row = realtime_rows[message_id]
            writer.writerow(row.to_output_dict(action="extra_in_realtime", in_realtime=True, in_batch=False))

        for message_id in consistent_ids:
            row = realtime_rows[message_id]
            writer.writerow(row.to_output_dict(action="consistent", in_realtime=True, in_batch=True))

    print(f"[INFO] Realtime records: {len(realtime_rows)}")
    print(f"[INFO] Batch records: {len(batch_rows)}")
    print(f"[INFO] Missing in realtime: {len(missing_in_realtime)}")
    print(f"[INFO] Extra in realtime: {len(extra_in_realtime)}")
    print(f"[INFO] Consistent: {len(consistent_ids)}")
    print(f"[INFO] Reconcile csv: {output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
