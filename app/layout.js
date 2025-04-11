import './globals.css';

export const metadata = {
  title: 'Sistema de Inventario',
  description: 'Una aplicación simple para gestionar inventario',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <div className="container mx-auto">
          {children}
        </div>
        <footer className="mt-8 py-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Sistema de Inventario - Creado con Next.js
        </footer>
      </body>
    </html>
  );
}