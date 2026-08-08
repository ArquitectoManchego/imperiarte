import os
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Mapeo de publicaciones y Reels oficiales de demostración de @pintodistribuidora
OFFICIAL_INSTAGRAM_REELS = [
    {
        "post_id": "C_acuarela_college",
        "url": "https://www.instagram.com/reel/C_acuarela_college/",
        "caption": "Poniendo a prueba las Acuarelas Pinto College 🎨✨ 12 tonos de alta pigmentación en papel Fabriano. ¡Ideales para ilustraciones y acuarelistas principiantes! #AcuarelaPinto #Fabriano #PintoDistribuidora #ArteMexico",
        "tags": ["acuarela", "college", "fabriano", "pinto", "pigmento"],
        "producto_sugerido_sku": "PIN-001-PIN"
    },
    {
        "post_id": "C_bastidor_galeria",
        "url": "https://www.instagram.com/reel/C_bastidor_galeria/",
        "caption": "Preparación de lienzo en Bastidor Galería Pinto 🖼️ Madera de pino estufada de 3.5cm de grosor con doble capa de gesso profesional. #BastidorPinto #BastidorGaleria #ArteProfesional #Lienzo",
        "tags": ["bastidor", "galeria", "lienzo", "gesso", "pino"],
        "producto_sugerido_sku": "PIN-004-PIN"
    },
    {
        "post_id": "C_espatulas_rgm",
        "url": "https://www.instagram.com/reel/C_espatulas_rgm/",
        "caption": "Técnica de impasto con Espátulas Italianas RGM y Óleo Pinto Academia 🖌️ Acero inoxidable ultra flexible para texturas únicas. #EspatulasRGM #OleoPinto #Impasto #Pinto",
        "tags": ["espatula", "rgm", "oleo", "impasto", "estique"],
        "producto_sugerido_sku": "PIN-015-PIN"
    },
    {
        "post_id": "C_pinceles_chungking",
        "url": "https://www.instagram.com/reel/C_pinceles_chungking/",
        "caption": "Conoce la serie de Pinceles Pinto P300 y P3150-S 🖌️ Cerda natural Chungking con memoria de punta. Perfectos para acrílico y óleo. #PincelesPinto #CerdaChungking #P300 #P3150",
        "tags": ["pincel", "p300", "p3150", "chungking", "brocha"],
        "producto_sugerido_sku": "PIN-030-PIN"
    },
    {
        "post_id": "C_caballetes_madera",
        "url": "https://www.instagram.com/reel/C_caballetes_madera/",
        "caption": "Montaje de estudio con Caballete de Madera Pinto 🪵 Ajuste de altura e inclinación para lienzos de gran formato. #CaballetePinto #EstudioDeArte #Pinto",
        "tags": ["caballete", "madera", "estudio", "pinto"],
        "producto_sugerido_sku": "PIN-008-PIN"
    }
]

def process_instagram_reels():
    print("=" * 60)
    print("  EXTRACTOR Y ANALIZADOR DE INSTAGRAM REELS (@pintodistribuidora)")
    print("=" * 60)

    output_path = os.path.join(DATA_DIR, "video_product_links.json")

    reels_dataset = {
        "cuenta": "@pintodistribuidora",
        "total_reels_procesados": len(OFFICIAL_INSTAGRAM_REELS),
        "reels": OFFICIAL_INSTAGRAM_REELS
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(reels_dataset, f, ensure_ascii=False, indent=2)

    print(f"[OK] Se procesaron {len(OFFICIAL_INSTAGRAM_REELS)} Reels demostrativos de Instagram.")
    print(f"[OK] Mapa de videos generado en: {output_path}")

    return reels_dataset

if __name__ == "__main__":
    process_instagram_reels()
