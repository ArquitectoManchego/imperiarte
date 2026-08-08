import os
import json
import tkinter as tk
from tkinter import filedialog, messagebox
try:
    import fitz  # PyMuPDF
    from PIL import Image, ImageTk
    HAS_PDF_LIBS = True
except ImportError:
    HAS_PDF_LIBS = False

class PDFProductExtractorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Extractor Interactivo de Productos - Papel Pinto")
        self.root.geometry("1100x750")
        self.root.configure(bg="#1e1e2e")

        self.pdf_doc = None
        self.current_page = 0
        self.total_pages = 0
        self.products = []
        self.image_ref = None

        self.setup_ui()
        if not HAS_PDF_LIBS:
            messagebox.showwarning(
                "Librerías Faltantes",
                "Para visualizar los PDFs directamente en la app, instala las librerías con:\n\npip install PyMuPDF Pillow"
            )

    def setup_ui(self):
        # Header Bar
        header = tk.Frame(self.root, bg="#181825", height=50)
        header.pack(fill="x", side="top")
        
        lbl_title = tk.Label(
            header, text="📄 Extractor Interactivo de Productos (Pinto)", 
            font=("Segoe UI", 14, "bold"), fg="#cdd6f4", bg="#181825"
        )
        lbl_title.pack(side="left", padx=15, pady=10)

        btn_open = tk.Button(
            header, text="📁 Abrir PDF", font=("Segoe UI", 10, "bold"),
            bg="#89b4fa", fg="#11111b", activebackground="#b4befe",
            relief="flat", command=self.load_pdf
        )
        btn_open.pack(side="right", padx=15, pady=8)

        # Main Layout: Left = PDF Viewer, Right = Product Data Form
        main_frame = tk.Frame(self.root, bg="#1e1e2e")
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # LEFT PANEL: PDF Viewer
        left_panel = tk.Frame(main_frame, bg="#181825", bd=1, relief="solid")
        left_panel.pack(side="left", fill="both", expand=True, padx=(0, 5))

        # Nav bar for PDF
        nav_frame = tk.Frame(left_panel, bg="#181825")
        nav_frame.pack(fill="x", pady=5)

        self.btn_prev = tk.Button(
            nav_frame, text="◀ Anterior", command=self.prev_page,
            bg="#313244", fg="#cdd6f4", relief="flat", state="disabled"
        )
        self.btn_prev.pack(side="left", padx=10)

        self.lbl_page_num = tk.Label(nav_frame, text="Página: 0 / 0", bg="#181825", fg="#a6adc8")
        self.lbl_page_num.pack(side="left", expand=True)

        self.btn_next = tk.Button(
            nav_frame, text="Siguiente ▶", command=self.next_page,
            bg="#313244", fg="#cdd6f4", relief="flat", state="disabled"
        )
        self.btn_next.pack(side="right", padx=10)

        # Canvas for Image
        self.canvas_frame = tk.Frame(left_panel, bg="#11111b")
        self.canvas_frame.pack(fill="both", expand=True, padx=5, pady=5)

        self.canvas = tk.Canvas(self.canvas_frame, bg="#11111b", highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # RIGHT PANEL: Data Form
        right_panel = tk.Frame(main_frame, bg="#181825", width=420, bd=1, relief="solid")
        right_panel.pack(side="right", fill="y", padx=(5, 0))
        right_panel.pack_propagate(False)

        form_title = tk.Label(
            right_panel, text="📌 Registrar Producto de esta Página",
            font=("Segoe UI", 12, "bold"), fg="#a6e3a1", bg="#181825"
        )
        form_title.pack(anchor="w", padx=15, pady=(15, 10))

        # Form Fields
        self.fields = {}
        fields_def = [
            ("Nombre del Producto", "nombre", "Ej. Papel Pinto Opalina Texturizada"),
            ("Categoría / Línea", "categoria", "Ej. Opalinas / Especiales"),
            ("Gramaje / Medida", "gramaje", "Ej. 240g - 50x70cm"),
            ("Precio de Lista ($)", "precio", "Ej. 150.00"),
            ("Stock Inicial", "stock", "Ej. 50"),
            ("Enlace IG / Video Local", "media_url", "Ej. https://instagram.com/p/..."),
            ("Descripción / Usos", "descripcion", "Ej. Ideal para acuarela, serigrafía y tarjetas premium.")
        ]

        for label_text, key, placeholder in fields_def:
            lbl = tk.Label(right_panel, text=label_text, font=("Segoe UI", 9, "bold"), fg="#cdd6f4", bg="#181825")
            lbl.pack(anchor="w", padx=15, pady=(5, 2))
            
            if key == "descripcion":
                txt = tk.Text(right_panel, height=3, font=("Segoe UI", 9), bg="#313244", fg="#cdd6f4", insertbackground="white", relief="flat")
                txt.pack(fill="x", padx=15, pady=(0, 5))
                self.fields[key] = txt
            else:
                entry = tk.Entry(right_panel, font=("Segoe UI", 9), bg="#313244", fg="#cdd6f4", insertbackground="white", relief="flat")
                entry.pack(fill="x", padx=15, pady=(0, 5))
                self.fields[key] = entry

        # Save Button
        btn_add = tk.Button(
            right_panel, text="➕ Guardar Producto", font=("Segoe UI", 10, "bold"),
            bg="#a6e3a1", fg="#11111b", activebackground="#94e2d5",
            relief="flat", command=self.add_product
        )
        btn_add.pack(fill="x", padx=15, pady=15)

        # Export JSON Button
        btn_export = tk.Button(
            right_panel, text="💾 Exportar Todo a JSON", font=("Segoe UI", 10, "bold"),
            bg="#fab387", fg="#11111b", activebackground="#f9e2af",
            relief="flat", command=self.export_json
        )
        btn_export.pack(fill="x", padx=15, pady=5)

        # Status Label
        self.lbl_status = tk.Label(right_panel, text="Productos registrados: 0", font=("Segoe UI", 9), fg="#bac2de", bg="#181825")
        self.lbl_status.pack(pady=10)

    def load_pdf(self):
        file_path = filedialog.askopenfilename(filetypes=[("Archivos PDF", "*.pdf")])
        if not file_path:
            return

        if not HAS_PDF_LIBS:
            messagebox.showerror("Error", "Instala PyMuPDF y Pillow usando:\npip install PyMuPDF Pillow")
            return

        try:
            self.pdf_doc = fitz.open(file_path)
            self.total_pages = len(self.pdf_doc)
            self.current_page = 0
            self.render_page()
            self.update_nav()
        except Exception as e:
            messagebox.showerror("Error al abrir PDF", str(e))

    def render_page(self):
        if not self.pdf_doc or self.total_pages == 0:
            return

        page = self.pdf_doc.load_page(self.current_page)
        pix = page.get_pixmap(dpi=120)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        # Resize to fit canvas
        canvas_width = max(self.canvas.winfo_width(), 500)
        canvas_height = max(self.canvas.winfo_height(), 600)
        
        img.thumbnail((canvas_width, canvas_height), Image.Resampling.LANCZOS)
        self.image_ref = ImageTk.PhotoImage(img)

        self.canvas.delete("all")
        self.canvas.create_image(
            canvas_width // 2, canvas_height // 2, anchor="center", image=self.image_ref
        )
        self.lbl_page_num.config(text=f"Página: {self.current_page + 1} / {self.total_pages}")

    def update_nav(self):
        self.btn_prev.config(state="normal" if self.current_page > 0 else "disabled")
        self.btn_next.config(state="normal" if self.current_page < self.total_pages - 1 else "disabled")

    def prev_page(self):
        if self.current_page > 0:
            self.current_page -= 1
            self.render_page()
            self.update_nav()

    def next_page(self):
        if self.current_page < self.total_pages - 1:
            self.current_page += 1
            self.render_page()
            self.update_nav()

    def add_product(self):
        data = {}
        for key, widget in self.fields.items():
            if isinstance(widget, tk.Text):
                data[key] = widget.get("1.0", "end-1c").strip()
            else:
                data[key] = widget.get().strip()

        if not data.get("nombre"):
            messagebox.showwarning("Campo requerido", "Debes ingresar al menos el Nombre del Producto.")
            return

        # Try parsing numeric fields
        try:
            data["precio"] = float(data["precio"]) if data.get("precio") else 0.0
        except ValueError:
            data["precio"] = 0.0

        try:
            data["stock"] = int(data["stock"]) if data.get("stock") else 0
        except ValueError:
            data["stock"] = 0

        data["pagina_pdf"] = self.current_page + 1
        self.products.append(data)

        # Clear form
        for key, widget in self.fields.items():
            if isinstance(widget, tk.Text):
                widget.delete("1.0", "end")
            else:
                widget.delete(0, "end")

        self.lbl_status.config(text=f"Productos registrados: {len(self.products)}")
        messagebox.showinfo("Éxito", f"Producto '{data['nombre']}' registrado correctamente.")

    def export_json(self):
        if not self.products:
            messagebox.showwarning("Sin datos", "No hay productos registrados para exportar.")
            return

        save_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON File", "*.json")],
            initialfile="productos_pinto_extraidos.json"
        )
        if save_path:
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(self.products, f, ensure_ascii=False, indent=2)
            messagebox.showinfo("Exportación Completada", f"Se exportaron {len(self.products)} productos a:\n{save_path}")

if __name__ == "__main__":
    root = tk.Tk()
    app = PDFProductExtractorApp(root)
    root.mainloop()
