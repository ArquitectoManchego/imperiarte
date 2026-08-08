const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'conocimiento_productos_pinto.json');
const targetSamplePath = path.join(__dirname, '..', 'lib', 'sampleProducts.js');

function syncDataToApp() {
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ No se encontró el archivo JSON de conocimiento en data/conocimiento_productos_pinto.json");
    return;
  }

  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(rawData);
    const products = parsed.productos || [];

    const formattedProducts = products.map(p => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria || "Especialidades Pinto",
      gramaje: p.gramaje || "Medida estándar",
      costo: p.costo,
      precio: p.precio_tienda,
      stock: p.stock || 100,
      descripcion: p.descripcion || "",
      media_url: p.media_url || "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop",
      video_url: p.video_url || "",
      variantes: [
        { 
          id: `v_${p.id}`, 
          nombre: p.nombre, 
          sku: p.sku, 
          costo: p.costo, 
          precio: p.precio_tienda, 
          stock: p.stock || 100 
        }
      ]
    }));

    const fileContent = `export const MOCK_PRODUCTS = ${JSON.stringify(formattedProducts, null, 2)};\n`;
    fs.writeFileSync(targetSamplePath, fileContent, 'utf8');
    console.log(`✅ Sincronizados ${formattedProducts.length} productos con la aplicación web en: ${targetSamplePath}`);
  } catch (err) {
    console.error("❌ Error al sincronizar datos:", err);
  }
}

syncDataToApp();
