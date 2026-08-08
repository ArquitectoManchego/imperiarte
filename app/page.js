"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/sampleProducts";
import { 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  Search, 
  Package, 
  FileText, 
  Instagram, 
  Layers, 
  Plus,
  Video,
  ExternalLink,
  CheckCircle,
  X
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [showPrices, setShowPrices] = useState(true);
  const [activeTab, setActiveTab] = useState("catalogo"); // catalogo | tpv | inventario | precios
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // TPV Cart State
  const [cart, setCart] = useState([]);
  
  // Media Modal State
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Ticket Modal State
  const [completedSale, setCompletedSale] = useState(null);

  const categories = ["Todas", "Opalinas", "Ecológicos", "Arte & Edición", "Translúcidos", "Metalizados"];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Todas" || p.categoria === selectedCategory;
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.gramaje.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart Functions
  const addToCart = (product, variante = null) => {
    const itemKey = variante ? `${product.id}-${variante.id}` : product.id;
    const existing = cart.find(item => item.key === itemKey);
    
    const itemPrice = variante ? variante.precio : product.precio;
    const itemTitle = variante ? `${product.nombre} (${variante.nombre})` : product.nombre;

    if (existing) {
      setCart(cart.map(item => item.key === itemKey ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { key: itemKey, id: product.id, title: itemTitle, price: itemPrice, qty: 1 }]);
    }
  };

  const updateCartQty = (key, delta) => {
    setCart(cart.map(item => {
      if (item.key === key) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const saleData = {
      id: `VENTA-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString("es-MX"),
      items: [...cart],
      total: calculateTotal()
    };
    setCompletedSale(saleData);
    setCart([]);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand-logo">
          <span>IMPERIARTE</span>
          <span className="brand-badge">PINTO EXCLUSIVO</span>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-links">
          <button 
            className={`nav-item ${activeTab === "catalogo" ? "active" : ""}`}
            onClick={() => setActiveTab("catalogo")}
          >
            <Layers size={18} /> Catálogo Interactivo
          </button>
          <button 
            className={`nav-item ${activeTab === "tpv" ? "active" : ""}`}
            onClick={() => setActiveTab("tpv")}
          >
            <ShoppingBag size={18} /> TPV (Punto de Venta) {cart.length > 0 && `(${cart.length})`}
          </button>
          <button 
            className={`nav-item ${activeTab === "inventario" ? "active" : ""}`}
            onClick={() => setActiveTab("inventario")}
          >
            <Package size={18} /> Inventario & Stock
          </button>
          <button 
            className={`nav-item ${activeTab === "precios" ? "active" : ""}`}
            onClick={() => setActiveTab("precios")}
          >
            <FileText size={18} /> Lista de Precios
          </button>
        </div>

        {/* Client / Seller Price Mode Toggle */}
        <div 
          className="mode-toggle"
          onClick={() => setShowPrices(!showPrices)}
          title="Alternar visibilidad de precios para clientes"
        >
          {showPrices ? <Eye size={18} color="#e5b869" /> : <EyeOff size={18} color="#9ca3af" />}
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: showPrices ? "#e5b869" : "#9ca3af" }}>
            {showPrices ? "Modo Vendedor (Precios Visibles)" : "Modo Cliente (Precios Ocultos)"}
          </span>
          <div className={`switch-track ${showPrices ? "active" : ""}`}>
            <div className="switch-thumb" />
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <h1 className="hero-title">Papel de Especialidad Pinto</h1>
        <p className="hero-subtitle">
          Catálogo digital de venta exclusiva, control de inventario y punto de venta en tiempo real para talleres, diseñadores e imprentas.
        </p>

        {/* Search & Category Filter */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ position: "relative", minWidth: "320px", flexGrow: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input 
              type="text"
              placeholder="Buscar por nombre de papel, gramaje, acabado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.6rem",
                borderRadius: "30px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  border: selectedCategory === cat ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                  background: selectedCategory === cat ? "rgba(229, 184, 105, 0.15)" : "var(--bg-card)",
                  color: selectedCategory === cat ? "var(--accent-gold)" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT BASED ON ACTIVE TAB */}

      {/* TAB 1: CATALOGO INTERACTIVO */}
      {activeTab === "catalogo" && (
        <div className="product-grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="product-card">
              <div className="card-img-wrapper">
                <img src={p.media_url} alt={p.nombre} className="card-img" />
                <span className="category-tag">{p.categoria}</span>
              </div>

              <div className="card-body">
                <h3 className="product-title">{p.nombre}</h3>
                <div className="product-specs">{p.gramaje} • Stock: {p.stock} pliegos</div>
                <p className="product-desc">{p.descripcion}</p>

                {/* Media Button */}
                {p.video_url && (
                  <button 
                    onClick={() => setSelectedMedia(p)}
                    style={{
                      background: "rgba(99, 102, 241, 0.15)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      color: "#818cf8",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginBottom: "1rem",
                      width: "fit-content"
                    }}
                  >
                    <Instagram size={14} /> Ver demostración en Instagram / Video
                  </button>
                )}

                <div className="card-footer">
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Precio Pliego</span>
                    <span className={`price-tag ${!showPrices ? "hidden" : ""}`}>
                      ${p.precio.toFixed(2)} MXN
                    </span>
                  </div>

                  <button className="btn-primary" onClick={() => addToCart(p)}>
                    <Plus size={16} /> Al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TERMINAL PUNTO DE VENTA (TPV) */}
      {activeTab === "tpv" && (
        <div className="tpv-container">
          {/* Left Panel: Products List */}
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: 700 }}>Catálogo Rápido TPV</h2>
            <div className="product-grid" style={{ padding: 0, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {filteredProducts.map(p => (
                <div key={p.id} className="product-card" style={{ padding: "1rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>{p.nombre}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginBottom: "0.75rem" }}>{p.gramaje}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>${p.precio.toFixed(2)}</span>
                    <button className="btn-gold" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => addToCart(p)}>
                      + Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Active Cart */}
          <div className="tpv-cart">
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShoppingBag size={20} color="var(--accent-gold)" /> Carrito de Venta
            </h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                El carrito está vacío.<br />Haz clic en agregar productos.
              </div>
            ) : (
              <>
                <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "400px" }}>
                  {cart.map(item => (
                    <div key={item.key} className="cart-item">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          ${item.price.toFixed(2)} x {item.qty} = <strong>${(item.price * item.qty).toFixed(2)}</strong>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <button 
                          onClick={() => updateCartQty(item.key, -1)}
                          style={{ background: "#374151", border: "none", color: "#fff", width: "24px", height: "24px", borderRadius: "4px", cursor: "pointer" }}
                        >-</button>
                        <span style={{ fontWeight: 600, padding: "0 0.4rem" }}>{item.qty}</span>
                        <button 
                          onClick={() => updateCartQty(item.key, 1)}
                          style={{ background: "#374151", border: "none", color: "#fff", width: "24px", height: "24px", borderRadius: "4px", cursor: "pointer" }}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "2px dashed var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem" }}>
                    <span>TOTAL:</span>
                    <span style={{ color: "var(--accent-gold)" }}>${calculateTotal().toFixed(2)} MXN</span>
                  </div>

                  <button className="btn-gold" style={{ width: "100%", padding: "0.8rem", fontSize: "1rem" }} onClick={handleCheckout}>
                    💳 Completar Venta e Imprimir Ticket
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTARIO */}
      {activeTab === "inventario" && (
        <div style={{ maxWidth: "1200px", margin: "2rem auto", width: "100%", padding: "0 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Gestión de Inventario Papel Pinto</h2>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#11141f", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "1rem" }}>Producto</th>
                  <th style={{ padding: "1rem" }}>Categoría</th>
                  <th style={{ padding: "1rem" }}>Gramaje / Medida</th>
                  <th style={{ padding: "1rem" }}>Precio</th>
                  <th style={{ padding: "1rem" }}>Stock Disponible</th>
                  <th style={{ padding: "1rem" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{p.nombre}</td>
                    <td style={{ padding: "1rem", color: "var(--accent-gold)" }}>{p.categoria}</td>
                    <td style={{ padding: "1rem" }}>{p.gramaje}</td>
                    <td style={{ padding: "1rem", fontWeight: 700 }}>${p.precio.toFixed(2)}</td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{p.stock} pliegos</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: p.stock > 100 ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                        color: p.stock > 100 ? "#10b981" : "#f43f5e",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: 700
                      }}>
                        {p.stock > 100 ? "Stock Saludable" : "Bajo Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LISTA DE PRECIOS */}
      {activeTab === "precios" && (
        <div style={{ maxWidth: "1000px", margin: "2rem auto", width: "100%", padding: "0 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Lista Oficial de Precios Pinto 2026</h2>
            <button className="btn-primary" onClick={() => window.print()}>
              🖨 Imprimir Lista de Precios
            </button>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{p.nombre}</h3>
                  <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-gold)" }}>${p.precio.toFixed(2)} MXN</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{p.gramaje} • {p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEDIA MODAL (INSTAGRAM / VIDEO) */}
      {selectedMedia && (
        <div className="modal-overlay" onClick={() => setSelectedMedia(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Video color="#818cf8" /> Demostración de {selectedMedia.nombre}
              </h3>
              <button onClick={() => setSelectedMedia(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ width: "100%", height: "250px", borderRadius: "12px", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", border: "1px solid var(--border-subtle)" }}>
              <Instagram size={48} color="#e5b869" />
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "0 1rem" }}>
                Enlace a contenido multimedia en Instagram o almacenamiento local:
              </p>
              <a 
                href={selectedMedia.video_url || "#"} 
                target="_blank" 
                rel="noreferrer"
                className="btn-gold"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                Abrir Video / Post en Instagram <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SALE / TICKET MODAL */}
      {completedSale && (
        <div className="modal-overlay" onClick={() => setCompletedSale(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>¡Venta Completada con Éxito!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Folio: {completedSale.id} • {completedSale.date}</p>

            <div style={{ background: "#11141f", padding: "1rem", borderRadius: "10px", textAlign: "left", marginBottom: "1.5rem" }}>
              {completedSale.items.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span>{item.qty}x {item.title}</span>
                  <strong>${(item.price * item.qty).toFixed(2)}</strong>
                </div>
              ))}
              <hr style={{ borderColor: "var(--border-subtle)", margin: "0.75rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem" }}>
                <span>TOTAL COBRADO:</span>
                <span style={{ color: "var(--accent-gold)" }}>${completedSale.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <button className="btn-gold" style={{ width: "100%" }} onClick={() => setCompletedSale(null)}>
              Cerrar y Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
