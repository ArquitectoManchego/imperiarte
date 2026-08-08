"use client";

import { useState } from "react";
import { MOCK_PRODUCTS } from "@/lib/sampleProducts";
import { 
  ShoppingBag, 
  Eye, 
  Search, 
  Package, 
  FileText, 
  Instagram, 
  Layers, 
  Plus,
  Video,
  ExternalLink,
  CheckCircle,
  X,
  CreditCard,
  Banknote,
  Building2,
  Trash2,
  Printer,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Calculator
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  // View Mode: 'cliente' (Modo Venta / Precios Lista) vs 'vendedor' (Modo Vendedor / Costos + Márgenes)
  const [viewMode, setViewMode] = useState("vendedor");
  const [activeTab, setActiveTab] = useState("catalogo"); // catalogo | tpv | inventario | precios
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // TPV State
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo"); // efectivo | tarjeta | transferencia
  const [cashReceived, setCashReceived] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
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

  // Cart Operations
  const addToCart = (product, variante = null) => {
    const itemKey = variante ? `${product.id}-${variante.id}` : product.id;
    const existing = cart.find(item => item.key === itemKey);
    
    const itemPrice = variante ? variante.precio : product.precio;
    const itemCost = variante ? variante.costo : product.costo;
    const itemTitle = variante ? `${product.nombre} (${variante.nombre})` : product.nombre;
    const itemSku = variante ? variante.sku : `PIN-${product.id.toUpperCase()}`;

    if (existing) {
      setCart(cart.map(item => item.key === itemKey ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { 
        key: itemKey, 
        id: product.id, 
        title: itemTitle, 
        sku: itemSku,
        price: itemPrice, 
        cost: itemCost,
        qty: 1 
      }]);
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

  const removeFromCart = (key) => {
    setCart(cart.filter(item => item.key !== key));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const calculateTotalCost = () => {
    return cart.reduce((sum, item) => sum + item.cost * item.qty, 0);
  };

  const calculateChange = () => {
    const numReceived = parseFloat(cashReceived) || 0;
    const total = calculateTotal();
    return Math.max(0, numReceived - total);
  };

  const handleNumpadInput = (val) => {
    if (val === "CLEAR") {
      setCashReceived("");
    } else if (val === "BACKSPACE") {
      setCashReceived(prev => prev.slice(0, -1));
    } else {
      setCashReceived(prev => prev + val);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const total = calculateTotal();
    const totalCost = calculateTotalCost();
    const numReceived = parseFloat(cashReceived) || total;

    const saleData = {
      id: `TICKET-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString("es-MX"),
      items: [...cart],
      total,
      totalCost,
      profit: total - totalCost,
      paymentMethod,
      cashReceived: numReceived,
      change: Math.max(0, numReceived - total)
    };
    setCompletedSale(saleData);
    setCart([]);
    setCashReceived("");
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
            <Layers size={17} /> Catálogo
          </button>
          <button 
            className={`nav-item ${activeTab === "tpv" ? "active" : ""}`}
            onClick={() => setActiveTab("tpv")}
          >
            <ShoppingBag size={17} /> Terminal TPV {cart.length > 0 && `(${cart.length})`}
          </button>
          <button 
            className={`nav-item ${activeTab === "inventario" ? "active" : ""}`}
            onClick={() => setActiveTab("inventario")}
          >
            <Package size={17} /> Inventario
          </button>
          <button 
            className={`nav-item ${activeTab === "precios" ? "active" : ""}`}
            onClick={() => setActiveTab("precios")}
          >
            <FileText size={17} /> Precios
          </button>
        </div>

        {/* View Mode Switch (Modo Cliente vs Modo Vendedor con Costos) */}
        <div 
          className="mode-toggle"
          onClick={() => setViewMode(viewMode === "cliente" ? "vendedor" : "cliente")}
          title="Cambiar entre vista de cliente y vista de vendedor con costos"
        >
          {viewMode === "vendedor" ? (
            <ShieldCheck size={18} color="#e5b869" />
          ) : (
            <Eye size={18} color="#10b981" />
          )}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: viewMode === "vendedor" ? "#e5b869" : "#10b981" }}>
              {viewMode === "vendedor" ? "Modo Vendedor (Costos + Márgenes)" : "Modo Cliente (Precios de Lista)"}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {viewMode === "vendedor" ? "Muestra precio lista, costo y margen" : "Apto para mostrar pantalla a clientes"}
            </span>
          </div>
          <div className={`switch-track ${viewMode === "vendedor" ? "active" : ""}`}>
            <div className="switch-thumb" />
          </div>
        </div>
      </nav>

      {/* CONTENT BASED ON ACTIVE TAB */}

      {/* ========================================================
          TAB 1: CATALOGO INTERACTIVO
         ======================================================== */}
      {activeTab === "catalogo" && (
        <>
          <section style={{ padding: "2.5rem 2rem 1.5rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Catálogo de Papeles de Especialidad Pinto
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto 1.5rem" }}>
              {viewMode === "vendedor" 
                ? "👁️ Estás en Modo Vendedor: Puedes visualizar costos internos y márgenes de ganancia en tiempo real."
                : "✨ Estás en Modo Cliente: Precios de lista visibles para demostración directa."}
            </p>

            {/* Search & Category Filter */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
              <div style={{ position: "relative", minWidth: "300px", flexGrow: 1 }}>
                <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input 
                  type="text"
                  placeholder="Buscar papel, gramaje, textura..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem 0.7rem 2.6rem",
                    borderRadius: "30px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "20px",
                      border: selectedCategory === cat ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                      background: selectedCategory === cat ? "rgba(229, 184, 105, 0.15)" : "var(--bg-card)",
                      color: selectedCategory === cat ? "var(--accent-gold)" : "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="product-grid">
            {filteredProducts.map(p => {
              const profitMargin = p.precio - p.costo;
              const profitPercent = ((profitMargin / p.precio) * 100).toFixed(0);

              return (
                <div key={p.id} className="product-card">
                  <div className="card-img-wrapper">
                    <img src={p.media_url} alt={p.nombre} className="card-img" />
                    <span className="category-tag">{p.categoria}</span>
                  </div>

                  <div className="card-body">
                    <h3 className="product-title">{p.nombre}</h3>
                    <div className="product-specs">{p.gramaje} • Stock: {p.stock} pliegos</div>
                    <p className="product-desc">{p.descripcion}</p>

                    {/* Media Demo Button */}
                    {p.video_url && (
                      <button 
                        onClick={() => setSelectedMedia(p)}
                        style={{
                          background: "rgba(99, 102, 241, 0.12)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          color: "#818cf8",
                          padding: "0.35rem 0.7rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          marginBottom: "0.85rem",
                          width: "fit-content"
                        }}
                      >
                        <Instagram size={14} /> Demostración Instagram / Video
                      </button>
                    )}

                    <div className="card-footer">
                      <div className="prices-container">
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Precio Lista</span>
                          <span className="price-tag">${p.precio.toFixed(2)}</span>
                        </div>

                        {/* VENDOR MODE: Displays Product Cost + Profit Margin */}
                        {viewMode === "vendedor" && (
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            <span className="cost-badge" title="Costo Interno del Producto">
                              Costo: ${p.costo.toFixed(2)}
                            </span>
                            <span className="margin-badge" title="Margen de Ganancia">
                              +{profitPercent}% (${profitMargin.toFixed(2)})
                            </span>
                          </div>
                        )}
                      </div>

                      <button className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} onClick={() => addToCart(p)}>
                        <Plus size={16} /> Agregar a Venta
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================
          TAB 2: TERMINAL COMPLETA PUNTO DE VENTA (TPV)
         ======================================================== */}
      {activeTab === "tpv" && (
        <div className="tpv-terminal">
          {/* LEFT: Quick Action Products Grid */}
          <div className="pos-catalog-panel">
            <div className="pos-search-bar">
              <input 
                type="text"
                className="pos-search-input"
                placeholder="🔍 Escanear SKU o buscar por producto Pinto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="pos-grid">
              {filteredProducts.map(p => (
                <div key={p.id} className="pos-item-btn" onClick={() => addToCart(p)}>
                  <div>
                    <div className="pos-item-title">{p.nombre}</div>
                    <div className="pos-item-sku">{p.gramaje}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.5rem" }}>
                    <span className="pos-item-price">${p.precio.toFixed(2)}</span>
                    <span style={{ fontSize: "0.75rem", background: "#313244", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "#cdd6f4" }}>
                      + TPV
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Full Terminal Receipt & Payment Panel */}
          <div className="pos-receipt-panel">
            <div className="pos-receipt-header">
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShoppingBag size={18} color="var(--accent-gold)" /> Terminal de Cobro TPV
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Papelería de Especialidad Pinto</span>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])} 
                  style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.2rem" }}
                >
                  <Trash2 size={14} /> Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="pos-receipt-list">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                  <Calculator size={40} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.9rem" }}>Terminal lista para cobrar.</p>
                  <span style={{ fontSize: "0.8rem" }}>Haz clic en los productos para agregarlos al ticket.</span>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="pos-cart-row">
                    <div style={{ flexGrow: 1, paddingRight: "0.5rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>{item.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {item.sku} • ${item.price.toFixed(2)} x {item.qty}
                      </div>
                      {viewMode === "vendedor" && (
                        <div style={{ fontSize: "0.72rem", color: "#a5b4fc", fontFamily: "'JetBrains Mono', monospace" }}>
                          Costo: ${(item.cost * item.qty).toFixed(2)} (Ganancia: ${((item.price - item.cost) * item.qty).toFixed(2)})
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <button 
                        onClick={() => updateCartQty(item.key, -1)}
                        style={{ background: "#2a3142", border: "none", color: "#fff", width: "26px", height: "26px", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }}
                      >-</button>
                      <span style={{ fontWeight: 800, minWidth: "20px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{item.qty}</span>
                      <button 
                        onClick={() => updateCartQty(item.key, 1)}
                        style={{ background: "#2a3142", border: "none", color: "#fff", width: "26px", height: "26px", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }}
                      >+</button>
                      <button 
                        onClick={() => removeFromCart(item.key)}
                        style={{ background: "none", border: "none", color: "#f43f5e", marginLeft: "0.3rem", cursor: "pointer" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pay-methods">
              <button 
                className={`pay-btn ${paymentMethod === "efectivo" ? "active" : ""}`}
                onClick={() => setPaymentMethod("efectivo")}
              >
                <Banknote size={16} style={{ display: "block", margin: "0 auto 0.2rem" }} /> Efectivo
              </button>
              <button 
                className={`pay-btn ${paymentMethod === "tarjeta" ? "active" : ""}`}
                onClick={() => setPaymentMethod("tarjeta")}
              >
                <CreditCard size={16} style={{ display: "block", margin: "0 auto 0.2rem" }} /> Tarjeta
              </button>
              <button 
                className={`pay-btn ${paymentMethod === "transferencia" ? "active" : ""}`}
                onClick={() => setPaymentMethod("transferencia")}
              >
                <Building2 size={16} style={{ display: "block", margin: "0 auto 0.2rem" }} /> Transfer
              </button>
            </div>

            {/* Touch Numpad for Cash Received */}
            {paymentMethod === "efectivo" && (
              <div className="pos-numpad">
                {["1", "2", "3", "50", "4", "5", "6", "100", "7", "8", "9", "200", "0", ".", "BACKSPACE", "CLEAR"].map(key => (
                  <button key={key} className="numpad-btn" onClick={() => handleNumpadInput(key)}>
                    {key === "BACKSPACE" ? "⌫" : key === "CLEAR" ? "C" : key}
                  </button>
                ))}
              </div>
            )}

            {/* Total & Checkout */}
            <div className="pos-checkout-bar">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                <span>Subtotal Venta:</span>
                <span>${calculateTotal().toFixed(2)} MXN</span>
              </div>

              {viewMode === "vendedor" && cart.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#34d399", marginBottom: "0.4rem" }}>
                  <span>Ganancia Total Estimada:</span>
                  <span>+${(calculateTotal() - calculateTotalCost()).toFixed(2)} MXN</span>
                </div>
              )}

              {paymentMethod === "efectivo" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#fff", marginBottom: "0.5rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Efectivo Recibido: ${cashReceived || "0.00"}</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>
                    Cambio: ${calculateChange().toFixed(2)}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.85rem", fontFamily: "'JetBrains Mono', monospace" }}>
                <span>TOTAL:</span>
                <span style={{ color: "var(--accent-gold)" }}>${calculateTotal().toFixed(2)} MXN</span>
              </div>

              <button 
                className="btn-gold" 
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", opacity: cart.length === 0 ? 0.5 : 1 }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                💳 PROCESAR COBRO E IMPRIMIR TICKET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: INVENTARIO
         ======================================================== */}
      {activeTab === "inventario" && (
        <div style={{ maxWidth: "1200px", margin: "2rem auto", width: "100%", padding: "0 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Gestión de Inventario Papel Pinto</h2>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#11141f", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "1rem" }}>Producto</th>
                  <th style={{ padding: "1rem" }}>Categoría</th>
                  <th style={{ padding: "1rem" }}>Gramaje</th>
                  {viewMode === "vendedor" && <th style={{ padding: "1rem" }}>Costo Interno</th>}
                  <th style={{ padding: "1rem" }}>Precio Lista</th>
                  {viewMode === "vendedor" && <th style={{ padding: "1rem" }}>Margen %</th>}
                  <th style={{ padding: "1rem" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const marginPercent = (((p.precio - p.costo) / p.precio) * 100).toFixed(0);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>{p.nombre}</td>
                      <td style={{ padding: "1rem", color: "var(--accent-gold)" }}>{p.categoria}</td>
                      <td style={{ padding: "1rem" }}>{p.gramaje}</td>
                      {viewMode === "vendedor" && <td style={{ padding: "1rem", color: "#a5b4fc" }}>${p.costo.toFixed(2)}</td>}
                      <td style={{ padding: "1rem", fontWeight: 700 }}>${p.precio.toFixed(2)}</td>
                      {viewMode === "vendedor" && <td style={{ padding: "1rem", color: "#34d399", fontWeight: 700 }}>+{marginPercent}%</td>}
                      <td style={{ padding: "1rem", fontWeight: 600 }}>{p.stock} pliegos</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: LISTA DE PRECIOS
         ======================================================== */}
      {activeTab === "precios" && (
        <div style={{ maxWidth: "1000px", margin: "2rem auto", width: "100%", padding: "0 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Lista Oficial de Precios Pinto 2026</h2>
            <button className="btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir Lista de Precios
            </button>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{p.nombre}</h3>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-gold)" }}>${p.precio.toFixed(2)} MXN</span>
                    {viewMode === "vendedor" && (
                      <span style={{ display: "block", fontSize: "0.78rem", color: "#a5b4fc" }}>Costo: ${p.costo.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{p.gramaje} • {p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEDIA DEMO MODAL */}
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

      {/* COMPLETED SALE / POS TICKET MODAL */}
      {completedSale && (
        <div className="modal-overlay" onClick={() => setCompletedSale(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: "center", maxWidth: "450px" }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>IMPERIARTE - PAPEL PINTO</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Ticket de Venta TPV #{completedSale.id}<br />{completedSale.date}
            </p>

            <div style={{ background: "#11141f", padding: "1.25rem", borderRadius: "10px", textAlign: "left", marginBottom: "1.5rem", fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", borderBottom: "1px dashed #374151", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                Método de Pago: <strong>{completedSale.paymentMethod.toUpperCase()}</strong>
              </div>

              {completedSale.items.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
                  <span>{item.qty}x {item.title}</span>
                  <strong>${(item.price * item.qty).toFixed(2)}</strong>
                </div>
              ))}

              <div style={{ borderTop: "1px dashed #374151", marginTop: "0.75rem", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
                  <span>TOTAL:</span>
                  <span style={{ color: "var(--accent-gold)" }}>${completedSale.total.toFixed(2)} MXN</span>
                </div>

                {completedSale.paymentMethod === "efectivo" && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                    Efectivo Recibido: ${completedSale.cashReceived.toFixed(2)}<br />
                    Cambio Entregado: ${completedSale.change.toFixed(2)}
                  </div>
                )}

                {viewMode === "vendedor" && (
                  <div style={{ fontSize: "0.78rem", color: "#34d399", marginTop: "0.5rem", paddingTop: "0.4rem", borderTop: "1px solid #1f293d" }}>
                    Ganancia de esta venta: +${completedSale.profit.toFixed(2)} MXN
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-primary" style={{ flexGrow: 1 }} onClick={() => window.print()}>
                <Printer size={16} /> Imprimir Ticket
              </button>
              <button className="btn-gold" style={{ flexGrow: 1 }} onClick={() => setCompletedSale(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
