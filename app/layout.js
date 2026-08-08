import "./globals.css";

export const metadata = {
  title: "ImperiArte - Distribuidor Exclusivo Papel Pinto",
  description: "Sistema TPV, Catálogo Interactivo y Gestión de Inventario para Papeles de Especialidad Pinto.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
