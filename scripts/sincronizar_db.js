const fs = require('fs');
const path = require('path');

const JSON_PDF_PATH = path.join(__dirname, '..', 'data', 'conocimiento_productos_pinto.json');
const JSON_WEB_PATH = path.join(__dirname, '..', 'data', 'conocimiento_web_pinto.json');
const JSON_VIDEO_PATH = path.join(__dirname, '..', 'data', 'video_product_links.json');
const SAMPLE_PRODUCTS_JS_PATH = path.join(__dirname, '..', 'lib', 'sampleProducts.js');
const PUBLIC_IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'pinto_official');

function getDownloadedImages() {
  if (!fs.existsSync(PUBLIC_IMG_DIR)) return [];
  return fs.readdirSync(PUBLIC_IMG_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .map(file => `/images/pinto_official/${file}`);
}

function assignCategory(nombre, marca, catOriginal) {
  const n = (nombre + " " + marca + " " + catOriginal).toLowerCase();
  
  if (n.includes("opalina") || n.includes("batería") || n.includes("bateria") || n.includes("ilustración") || n.includes("ilustracion") || n.includes("staedtler") || n.includes("isomars")) {
    return "Opalinas";
  }
  if (n.includes("favini") || n.includes("ecológi") || n.includes("ecologi") || n.includes("gris") || n.includes("fibra sólida") || n.includes("bkb")) {
    return "Ecológicos";
  }
  if (n.includes("fabriano") || n.includes("block") || n.includes("algodón") || n.includes("algodon") || n.includes("speedball") || n.includes("rgm")) {
    return "Arte & Edición";
  }
  if (n.includes("vegetal") || n.includes("transp") || n.includes("translúci") || n.includes("transluci") || n.includes("fome-cor") || n.includes("chartpak")) {
    return "Translúcidos";
  }
  if (n.includes("metaliz") || n.includes("decoart") || n.includes("kuretake") || n.includes("jacquard") || n.includes("iridiscente") || n.includes("oro") || n.includes("plata")) {
    return "Metalizados";
  }
  if (n.includes("bastidor") || n.includes("lienzo") || n.includes("loneta") || n.includes("caballete")) {
    return "Bastidores & Liencillos";
  }
  if (n.includes("pincel") || n.includes("brocha") || n.includes("espátula") || n.includes("espatula") || n.includes("godete") || n.includes("paleta")) {
    return "Pinceles & Herramientas";
  }
  return "Pinturas & Medios";
}

function sincronizarTodo() {
  console.log("============================================================");
  console.log("  SINCRONIZADOR UNIFICADO: CATEGORIZACIÓN & EXCEL 40% MARGEN");
  console.log("============================================================");

  let pdfProducts = [];
  if (fs.existsSync(JSON_PDF_PATH)) {
    const rawPdf = JSON.parse(fs.readFileSync(JSON_PDF_PATH, 'utf-8'));
    pdfProducts = rawPdf.productos || [];
  }

  let webData = {};
  if (fs.existsSync(JSON_WEB_PATH)) {
    webData = JSON.parse(fs.readFileSync(JSON_WEB_PATH, 'utf-8'));
  }

  let videoLinks = [];
  if (fs.existsSync(JSON_VIDEO_PATH)) {
    const rawVideo = JSON.parse(fs.readFileSync(JSON_VIDEO_PATH, 'utf-8'));
    videoLinks = rawVideo.reels || [];
  }

  const downloadedImages = getDownloadedImages();
  console.log(`[INFO] Se encontraron ${pdfProducts.length} productos PDF, ${Object.keys(webData).length} páginas web y ${downloadedImages.length} imágenes HD.`);

  const productosSincronizados = pdfProducts.map((p, idx) => {
    const pNameLower = p.nombre.toLowerCase();
    const finalCategory = assignCategory(p.nombre, p.marca, p.categoria);

    // Buscar imagen HD correspondiente
    let realMediaUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop";
    const matchedImg = downloadedImages.find(img => {
      const imgLower = img.toLowerCase();
      if (pNameLower.includes("acuarela") && imgLower.includes("acuarela")) return true;
      if (pNameLower.includes("bastidor") && imgLower.includes("bastidor")) return true;
      if (pNameLower.includes("pincel") && imgLower.includes("pincel")) return true;
      if (pNameLower.includes("oleo") && imgLower.includes("oleo")) return true;
      if (pNameLower.includes("caballete") && imgLower.includes("caballete")) return true;
      if (pNameLower.includes("espatula") && imgLower.includes("espatula")) return true;
      if (pNameLower.includes("godete") && imgLower.includes("godete")) return true;
      if (pNameLower.includes("block") && imgLower.includes("block")) return true;
      return false;
    });

    if (matchedImg) {
      realMediaUrl = matchedImg;
    } else if (downloadedImages.length > 0) {
      realMediaUrl = downloadedImages[idx % downloadedImages.length];
    }

    // Buscar video de Instagram
    let videoUrl = "https://www.instagram.com/pintodistribuidora/";
    const matchedVideo = videoLinks.find(v => {
      if (v.producto_sugerido_sku === p.sku) return true;
      return v.tags.some(tag => pNameLower.includes(tag));
    });

    if (matchedVideo) {
      videoUrl = matchedVideo.url;
    }

    // Enriquecer descripción con texto web si existe
    let enrichedDesc = p.descripcion;
    Object.values(webData).forEach(w => {
      if (w.descripciones && w.descripciones.length > 0) {
        const pageName = w.page.replace(".html", "");
        if (pNameLower.includes(pageName)) {
          enrichedDesc = `${w.descripciones.join(" ")} (Catálogo fuente: ${p.archivo_fuente})`;
        }
      }
    });

    return {
      id: p.id,
      nombre: p.nombre,
      sku: p.sku,
      marca: p.marca,
      categoria: finalCategory,
      linea: p.linea,
      gramaje: p.gramaje || "Especificación oficial según catálogo",
      costo: p.costo,
      precio: p.precio_tienda,
      stock: 0,
      descripcion: enrichedDesc,
      media_url: realMediaUrl,
      video_url: videoUrl,
      variantes: [
        {
          id: `v_${p.id}`,
          nombre: p.nombre,
          sku: p.sku,
          costo: p.costo,
          precio: p.precio_tienda,
          stock: 0
        }
      ]
    };
  });

  const jsContent = `// Base de Datos de Productos Pinto & Marcas Aliadas
// Generado automáticamente por scripts/sincronizar_db.js

export const MOCK_PRODUCTS = ${JSON.stringify(productosSincronizados, null, 2)};
`;

  fs.writeFileSync(SAMPLE_PRODUCTS_JS_PATH, jsContent, 'utf-8');
  console.log(`\n✅ Sincronizados ${productosSincronizados.length} productos enriquecidos con imágenes HD y Reels de Instagram en: ${SAMPLE_PRODUCTS_JS_PATH}`);
}

sincronizarTodo();
