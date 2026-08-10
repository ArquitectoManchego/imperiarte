import json
import os

report_path = os.path.join("data", "pdf_audit_report.json")
output_md = os.path.join("data", "reporte_desempeno_pdf.md")

with open(report_path, "r", encoding="utf-8") as f:
    report = json.load(f)

md_lines = []
md_lines.append("# Reporte de Desempeño y Lectura de Archivos PDF\n")
md_lines.append(f"- **Total de Archivos PDF Procesados**: {len(report)}")
md_lines.append(f"- **Total de Páginas Analizadas**: {sum(r['total_pages'] for r in report)}")
md_lines.append(f"- **Páginas con Texto Seleccionable Directo**: {sum(r['text_pages'] for r in report)}")
md_lines.append(f"- **Páginas Escaneadas / Formato Imagen**: {sum(r['image_only_pages'] for r in report)}")
md_lines.append(f"- **Archivos con Errores de Lectura/Incompatibilidad**: {len([r for r in report if len(r['errors']) > 0])}\n")

md_lines.append("| Archivo PDF | Total Páginas | Páginas Texto | Páginas Imagen | Estado de Lectura |")
md_lines.append("| :--- | :---: | :---: | :---: | :--- |")

for r in report:
    fn = r["file"]
    tp = r["total_pages"]
    tx = r["text_pages"]
    img = r["image_only_pages"]
    status = "⚠️ 100% Imagen / Escaneado" if tx == 0 else f"✅ Texto Directo ({tx}/{tp} págs)"
    md_lines.append(f"| `{fn}` | {tp} | {tx} | {img} | {status} |")

with open(output_md, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print(f"Reporte escrito en {output_md}")
