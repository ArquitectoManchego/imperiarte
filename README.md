# ImperiArte - Distribuidor Exclusivo Papel Pinto 📄

Aplicación web de venta de papel de especialidad, catálogo interactivo, control de inventario y Terminal Punto de Venta (TPV), acompañada de un extractor interactivo local para archivos PDF complejos.

---

## 🌟 Características Principales

1. **Catálogo Interactivo con Toggle de Precios**:
   - Muestra productos por categorías (*Opalinas, Ecológicos, Arte & Edición, Translúcidos, Metalizados*).
   - Interruptor **Modo Vendedor / Modo Cliente** para ocultar/desenfocar precios al presentar a clientes.
   - Buscador rápido por nombre, gramaje o acabados.
   - Enlace e integración con demostraciones en video / posts de Instagram.

2. **Terminal Punto de Venta (TPV)**:
   - Carrito de compra rápido.
   - Ajuste de cantidades en tiempo real.
   - Generación e impresión de recibos/tickets digitales de venta.

3. **Gestión de Inventario & Stock**:
   - Registro de pliegos disponibles por producto y variantes.
   - Indicadores visuales de bajo stock.

4. **Lista Oficial de Precios**:
   - Formato limpio optimizado para impresión o exportación.

5. **Extractor Local de PDFs Interactivo (Human-in-the-Loop)**:
   - Herramienta de escritorio en Python para procesar PDFs desordenados o escaneados de forma local sin usar créditos de IA.
   - Muestra la página del PDF en un panel y permite capturar de forma guiada los nombres, precios, variantes y fotos de los productos.

---

## 🚀 Guía de Inicio Rápido

### 1. Ejecutar la Aplicación Web Localmente

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

---

### 2. Usar el Extractor Interactivo de PDFs (Python)

Asegúrate de instalar PyMuPDF y Pillow para la previsualización gráfica de las páginas:

```bash
pip install PyMuPDF Pillow
```

Ejecuta la aplicación gráfica:

```bash
python pdf_extractor/gui_extractor.py
```

**Pasos en el extractor:**
1. Haz clic en **📁 Abrir PDF** y selecciona tu catálogo en PDF.
2. Navega entre las páginas usando los botones **◀ Anterior** y **Siguiente ▶**.
3. Completa los campos en el panel derecho (Nombre del producto, Precio, Gramaje, Enlace de IG, etc.).
4. Haz clic en **➕ Guardar Producto**.
5. Cuando termines con el documento, presiona **💾 Exportar Todo a JSON**.

---

### 3. Conexión con Firebase Firestore & Vercel

1. Crea un archivo `.env.local` en la raíz del proyecto con tus llaves de Firebase (de tu consola de Google Firebase):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

2. **Despliegue en Vercel**:
   - Sube este repositorio a tu cuenta de **GitHub**.
   - Ingresa a [Vercel.com](https://vercel.com) e importa tu repositorio de GitHub.
   - Añade las variables de entorno de Firebase en el panel de Vercel y presiona **Deploy**.

---

## 🛠️ Estructura del Proyecto

```text
ImperiArte/
├── app/
│   ├── globals.css         # Sistema de diseño visual (Glassmorphism, Modo Oscuro)
│   ├── layout.js          # Layout principal
│   └── page.js            # Dashboard (Catálogo, TPV, Inventario, Precios)
├── lib/
│   ├── firebase.js        # Configuración del SDK de Firebase
│   └── sampleProducts.js  # Catálogo inicial de muestra (Papeles Pinto)
├── pdf_extractor/
│   └── gui_extractor.py   # Aplicación GUI en Python para extracción de PDFs
├── package.json
└── README.md
```
