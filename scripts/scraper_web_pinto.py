import os
import sys
import json
import re
import urllib.parse

# Configuración de codificación UTF-8 en Windows
sys.stdout.reconfigure(encoding='utf-8')

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("[ERROR] Faltan librerías. Ejecuta: pip install requests beautifulsoup4")
    sys.exit(1)

BASE_URL = "https://www.pinto.com.mx/"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PUBLIC_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "pinto_official")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PUBLIC_IMG_DIR, exist_ok=True)

# Lista de subpáginas oficiales a raspar
PAGES_TO_SCRAPE = [
    "nuestro-catalogo.html",
    "acuarela-college.html",
    "bastidor.html",
    "battery-soul.html",
    "blocks.html",
    "caballetes.html",
    "carton-con-tela.html",
    "espatula-pinto-italy.html",
    "godetes-pinto.html",
    "herramientas-para-escultura.html",
    "medios.html",
    "obertone.html",
    "oleo.html",
    "paleta-desechable.html",
    "pincel.html",
    "pintura.html",
    "rollos.html",
    "sets-de-pincel.html"
]

def download_image(img_url, local_filename):
    """Descarga una imagen de alta resolución y la guarda en public/images/pinto_official/"""
    full_url = urllib.parse.urljoin(BASE_URL, img_url)
    target_path = os.path.join(PUBLIC_IMG_DIR, local_filename)

    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return f"/images/pinto_official/{local_filename}"

    try:
        resp = requests.get(full_url, timeout=10)
        if resp.status_code == 200:
            with open(target_path, "wb") as f:
                f.write(resp.content)
            return f"/images/pinto_official/{local_filename}"
    except Exception as e:
        print(f"   [WARN] No se pudo descargar {full_url}: {e}")

    return full_url

def scrape_official_pinto_site():
    print("=" * 60)
    print("  SCRAPER OFICIAL PINTO.COM.MX (0 TOKENS DE IA)")
    print("=" * 60)

    scraped_data = {}
    total_images_downloaded = 0

    for idx, page in enumerate(PAGES_TO_SCRAPE, start=1):
        url = urllib.parse.urljoin(BASE_URL, page)
        print(f"[{idx}/{len(PAGES_TO_SCRAPE)}] Procesando: {page} ...")

        try:
            r = requests.get(url, timeout=12)
            if r.status_code != 200:
                print(f"   [WARN] Código HTTP {r.status_code} en {page}")
                continue

            r.encoding = 'utf-8'
            soup = BeautifulSoup(r.text, 'html.parser')

            # Extraer Título de la sección
            title = soup.title.text.strip() if soup.title else page.replace(".html", "").title()

            # Extraer Párrafos Descriptivos
            paragraphs = []
            for p in soup.find_all('p'):
                txt = p.text.strip()
                if len(txt) > 25 and not "Aviso de Privacidad" in txt and not "Copyright" in txt:
                    paragraphs.append(txt)

            # Extraer Modelos / Series (ej. P100, P300, P3150-S)
            series_matches = set(re.findall(r'P\d{3,4}(?:-[A-Z])?', r.text))

            # Extraer Imágenes de Producto
            images = []
            img_tags = soup.find_all('img')
            for i_idx, img in enumerate(img_tags):
                src = img.get('data-src') or img.get('src') or ''
                if 'images/' in src and not 'blank.gif' in src and not 'logotipo' in src:
                    filename_clean = os.path.basename(urllib.parse.unquote(src)).split('?')[0]
                    if not filename_clean:
                        filename_clean = f"{page.replace('.html', '')}_{i_idx}.jpg"
                    
                    local_url = download_image(src, filename_clean)
                    if local_url.startswith("/images/"):
                        images.append(local_url)
                        total_images_downloaded += 1

            # Eliminar duplicados de imágenes
            images = list(dict.fromkeys(images))

            scraped_data[page] = {
                "page": page,
                "titulo": title,
                "url_oficial": url,
                "descripciones": paragraphs,
                "series_detectadas": list(series_matches),
                "imagenes_hd": images
            }

            print(f"   ✓ Descripciones: {len(paragraphs)} | Series: {len(series_matches)} | Fotos HD: {len(images)}")

        except Exception as e:
            print(f"   [ERROR] Error raspando {page}: {e}")

    # Guardar base JSON raspada
    output_json = os.path.join(DATA_DIR, "conocimiento_web_pinto.json")
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f" SCRAPING FINALIZADO: {len(scraped_data)} PÁGINAS RASPADAS | {total_images_downloaded} IMÁGENES GUARDADAS")
    print(f" Archivo guardado en: {output_json}")
    print("=" * 60)

    return scraped_data

if __name__ == "__main__":
    scrape_official_pinto_site()
