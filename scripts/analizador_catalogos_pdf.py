import os
import glob
import json
import csv
import sys
import re

# Asegurar codificación UTF-8 en stdout para Windows
sys.stdout.reconfigure(encoding='utf-8')

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.utils import get_column_letter
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False

# Configuración por defecto
DEFAULT_MARGIN = 0.40  # 40% de margen sobre el costo de compra
PDF_DIR = os.path.join(os.path.dirname(__file__), "..", "catalogos_pdf")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Catálogo base inicial de resguardo (Papeles Pinto)
SAMPLE_EXTRACTED_PRODUCTS = [
    {
        "id": "pinto-001",
        "sku": "PIN-OPT-220-BP",
        "nombre": "Papel Pinto Opalina Telada 220g",
        "categoria": "Opalinas",
        "gramaje": "220g - 70x100cm",
        "costo": 14.00,
        "margen_porcentaje": 0.40,
        "precio_tienda": 19.60,
        "stock": 450,
        "descripcion": "Superficie con textura tipo lino de alta definición. Ideal para invitaciones de lujo, diplomas y papelería corporativa.",
        "media_url": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop",
        "video_url": "https://www.instagram.com/p/C_sample1"
    },
    {
        "id": "pinto-002",
        "sku": "PIN-KRF-300-KN",
        "nombre": "Papel Pinto Kraft Especialidad 300g",
        "categoria": "Ecológicos",
        "gramaje": "300g - 61x90cm",
        "costo": 9.50,
        "margen_porcentaje": 0.40,
        "precio_tienda": 13.30,
        "stock": 1200,
        "descripcion": "Papel 100% reciclado de fibra larga con acabado satinado natural. Resistencia óptima para empaques de lujo y etiquetas.",
        "media_url": "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
        "video_url": ""
    },
    {
        "id": "pinto-003",
        "sku": "PIN-ALG-350-BF",
        "nombre": "Papel Pinto Algodón Grabado 350g",
        "categoria": "Arte & Edición",
        "gramaje": "350g - 56x76cm",
        "costo": 26.00,
        "margen_porcentaje": 0.40,
        "precio_tienda": 36.40,
        "stock": 310,
        "descripcion": "100% algodón con barbas en sus cuatro lados. pH neutro, libre de ácido. Perfecto para grabado, acuarela y Letterpress.",
        "media_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
        "video_url": "https://www.instagram.com/p/C_sample3"
    },
    {
        "id": "pinto-004",
        "sku": "PIN-VEG-110-TC",
        "nombre": "Papel Pinto Vegetal Translúcido 110g",
        "categoria": "Translúcidos",
        "gramaje": "110g - 70x100cm",
        "costo": 8.00,
        "margen_porcentaje": 0.40,
        "precio_tienda": 11.20,
        "stock": 800,
        "descripcion": "Transparencia homogénea sin nubosidades. Gran estabilidad dimensional para planos, capas overlay y envoltorios decorativos.",
        "media_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
        "video_url": ""
    },
    {
        "id": "pinto-005",
        "sku": "PIN-MET-250-PP",
        "nombre": "Papel Pinto Metalizado Perla 250g",
        "categoria": "Metalizados",
        "gramaje": "250g - 72x102cm",
        "costo": 18.50,
        "margen_porcentaje": 0.40,
        "precio_tienda": 25.90,
        "stock": 540,
        "descripcion": "Recubrimiento perlado iridiscente de doble cara. Brillo elegante resistente al roce, ideal para sobres premium.",
        "media_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
        "video_url": "https://www.instagram.com/p/C_sample5"
    }
]

def parse_pdf_file(pdf_path):
    """Extrae texto y datos de producto estructurados desde un archivo PDF."""
    products = []
    if not HAS_FITZ:
        return products

    try:
        doc = fitz.open(pdf_path)
        filename = os.path.basename(pdf_path)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            for i, line in enumerate(lines):
                if re.search(r'(papel|opalina|kraft|algodón|vegetal|metalizado|cartulina|pinto)', line, re.IGNORECASE):
                    costo_match = re.search(r'\$?\s*(\d+(\.\d+)?)\s*(costo|pesos|mxn)?', text, re.IGNORECASE)
                    costo_val = float(costo_match.group(1)) if costo_match else 15.00
                    
                    p_id = f"pinto-pdf-{len(products)+1:03d}"
                    precio_tienda = round(costo_val * (1 + DEFAULT_MARGIN), 2)
                    
                    products.append({
                        "id": p_id,
                        "sku": f"PIN-{p_id.upper()}",
                        "nombre": line,
                        "categoria": "Especialidades Pinto",
                        "gramaje": "Espec. estándar catalogada",
                        "costo": costo_val,
                        "margen_porcentaje": DEFAULT_MARGIN,
                        "precio_tienda": precio_tienda,
                        "stock": 100,
                        "descripcion": f"Producto catalogado desde PDF: {filename} (Página {page_num+1}).",
                        "origen_pdf": filename
                    })
    except Exception as e:
        print(f"[ERROR] Error procesando PDF {pdf_path}: {e}")

    return products

def generate_ai_knowledge_base(products):
    """Genera JSON y Markdown estructurados para consulta de IA."""
    json_path = os.path.join(DATA_DIR, "conocimiento_productos_pinto.json")
    md_path = os.path.join(DATA_DIR, "conocimiento_productos_pinto.md")

    # 1. JSON Knowledge Base
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "marca": "Pinto - Papelería de Especialidad",
            "total_productos": len(products),
            "margen_defecto": f"{int(DEFAULT_MARGIN*100)}%",
            "productos": products
        }, f, ensure_ascii=False, indent=2)
    print(f"[OK] Base de conocimiento JSON creada: {json_path}")

    # 2. Markdown Knowledge Base
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Base de Conocimiento de Productos - Papel de Especialidad Pinto\n\n")
        f.write(f"**Total de Productos Registrados:** {len(products)}\n")
        f.write(f"**Margen Estándar Aplicado sobre Costo:** {int(DEFAULT_MARGIN*100)}%\n\n")
        f.write("--- \n\n")

        for p in products:
            f.write(f"### {p['nombre']}\n")
            f.write(f"- **SKU**: `{p['sku']}`\n")
            f.write(f"- **Categoría**: {p['categoria']}\n")
            f.write(f"- **Gramaje / Medida**: {p['gramaje']}\n")
            f.write(f"- **Costo de Compra Proveedor**: `${p['costo']:.2f} MXN`\n")
            f.write(f"- **Margen Aplicado**: `{int(p['margen_porcentaje']*100)}%`\n")
            f.write(f"- **Precio de Venta en Tienda**: `${p['precio_tienda']:.2f} MXN`\n")
            f.write(f"- **Stock Disponible**: {p['stock']} pliegos\n")
            f.write(f"- **Descripción**: {p['descripcion']}\n\n")

    print(f"[OK] Base de conocimiento Markdown para IA creada: {md_path}")

def generate_editable_excel(products):
    """Genera catálogo editable en Excel (.xlsx) con FÓRMULAS automáticas para calcular precio de tienda."""
    excel_path = os.path.join(DATA_DIR, "catalogo_costos_y_precios_pinto.xlsx")
    csv_path = os.path.join(DATA_DIR, "catalogo_costos_y_precios_pinto.csv")

    # Export a CSV
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["SKU", "Nombre Producto", "Categoría", "Gramaje", "Costo Proveedor", "Margen %", "Precio Venta Tienda", "Stock Initial", "Descripción"])
        for p in products:
            writer.writerow([p["sku"], p["nombre"], p["categoria"], p["gramaje"], p["costo"], p["margen_porcentaje"], p["precio_tienda"], p["stock"], p["descripcion"]])
    print(f"[OK] Catálogo CSV creado: {csv_path}")

    # Export a Excel con Fórmulas
    if not HAS_OPENPYXL:
        print("[INFO] openpyxl no detectado. Para generar el archivo .xlsx estilizado con fórmulas, instala: pip install openpyxl")
        return

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Catálogo Costos y Precios Pinto"

    # Estilos visuales
    header_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="F3F4F6")
    formula_font = Font(name="Segoe UI", size=11, bold=True, color="059669")

    headers = [
        "SKU / ID", 
        "Nombre del Producto", 
        "Categoría", 
        "Gramaje / Medida", 
        "Costo Proveedor ($)", 
        "Margen Utilidad (%)", 
        "Precio Venta Tienda ($)", 
        "Stock (Pliegos)", 
        "Descripción / Aplicación"
    ]
    
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for i, p in enumerate(products, start=2):
        # Fórmula de Excel nativa: Costo * (1 + Margen%)
        formula_precio = f"=ROUND(E{i}*(1+F{i}), 2)"

        row = [
            p["sku"],
            p["nombre"],
            p["categoria"],
            p["gramaje"],
            p["costo"],
            p["margen_porcentaje"],
            formula_precio,
            p["stock"],
            p["descripcion"]
        ]
        ws.append(row)

        ws.cell(row=i, column=5).number_format = '"$"#,##0.00'  # Costo
        ws.cell(row=i, column=6).number_format = '0.0%'        # Margen
        ws.cell(row=i, column=7).number_format = '"$"#,##0.00'  # Precio Venta Fórmula
        ws.cell(row=i, column=7).font = formula_font
        ws.cell(row=i, column=8).number_format = '#,##0'       # Stock

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

    wb.save(excel_path)
    print(f"[OK] Catálogo Excel editable con fórmulas automáticas generado: {excel_path}")

def main():
    print("[INFO] Buscando archivos PDF de catálogos en carpeta /catalogos_pdf...")
    pdf_files = glob.glob(os.path.join(PDF_DIR, "*.pdf"))

    all_products = []
    if pdf_files:
        print(f"[INFO] Se encontraron {len(pdf_files)} catálogos PDF para procesar:")
        for pdf_path in pdf_files:
            print(f"   - Procesando: {os.path.basename(pdf_path)}")
            extracted = parse_pdf_file(pdf_path)
            all_products.extend(extracted)
    else:
        print("[INFO] No se encontraron archivos PDF nuevos en la carpeta /catalogos_pdf.")
        print("[INFO] Se procesará el catálogo base de Papel Pinto registrado como muestra inicial.")
        all_products = SAMPLE_EXTRACTED_PRODUCTS

    # Generar salidas
    generate_ai_knowledge_base(all_products)
    generate_editable_excel(all_products)

if __name__ == "__main__":
    main()
