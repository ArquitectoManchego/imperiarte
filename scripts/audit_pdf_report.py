import json
import os

report_path = os.path.join("data", "pdf_audit_report.json")
summary_path = os.path.join("data", "pdf_audit_summary.json")

with open(report_path, "r", encoding="utf-8") as f:
    report = json.load(f)

summary = {
    "total_files": len(report),
    "total_pages": sum(r["total_pages"] for r in report),
    "selectable_text_pages": sum(r["text_pages"] for r in report),
    "image_or_scanned_pages": sum(r["image_only_pages"] for r in report),
    "files_corrupted_or_error": len([r for r in report if len(r["errors"]) > 0]),
    "files_with_selectable_text": [r["file"] for r in report if r["text_pages"] > 0],
    "files_image_only": [f"{r['file']} ({r['total_pages']} pags)" for r in report if r["text_pages"] == 0]
}

with open(summary_path, "w", encoding="utf-8") as out:
    json.dump(summary, out, indent=2, ensure_ascii=False)

print(f"Total PDFs: {summary['total_files']}")
print(f"Total Pages: {summary['total_pages']}")
print(f"Selectable Text Pages: {summary['selectable_text_pages']}")
print(f"Image/Scanned Pages: {summary['image_or_scanned_pages']}")
print(f"Files with Errors: {summary['files_corrupted_or_error']}")
print(f"Files with Selectable Text: {summary['files_with_selectable_text']}")
