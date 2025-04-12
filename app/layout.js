import './globals.css';
import { interTight, inter, satoshi } from './config/fonts';

export const metadata = {
  title: 'Sistema de Inventario - GrowPals',
  description: 'Una aplicación para gestionar inventario con estilo GrowPals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${interTight.variable} ${inter.variable} ${satoshi.variable}`}>
      <body className="bg-bg-beige min-h-screen">
        <header className="bg-tertiary text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Sistema de Inventario</h1>
              <p className="text-sm">Your Business Fertilizer</p>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
        
        <footer className="bg-secondary text-white py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} GrowPals</p>
          </div>
        </footer>
      </body>
    </html>
  );
}