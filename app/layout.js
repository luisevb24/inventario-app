import './globals.css';
import { interTight, inter, satoshi } from './config/fonts';

export const metadata = {
  title: 'Sistema de Inventario - GrowPals',
  description: 'Una aplicación para gestionar inventario con estilo GrowPals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${interTight.variable} ${inter.variable} ${satoshi.variable}`}>
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-tertiary text-white py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">Sistema de Inventario</h1>
            <p>Powered by GrowPals</p>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
        
        <footer className="bg-secondary text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} GrowPals - Your Business Fertilizer</p>
          </div>
        </footer>
      </body>
    </html>
  );
}