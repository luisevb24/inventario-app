import './globals.css';
import { interTight, inter, satoshi } from './config/fonts';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Presupuesto',
  description: 'Una aplicación para gestionar inventario con estilo GrowPals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${interTight.variable} ${inter.variable} ${satoshi.variable}`}>
      <body className="bg-background text-tertiary min-h-screen flex flex-col">
        <header className="bg-secondary text-white py-4 font-satoshi font-semibold">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-10 mr-3 relative">
                  <Image
                    src="/growpalslogo.svg"
                    alt="growpalslogo"
                    fill
                    className="object-contain" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <Link href="/costos-unitarios" className="bg-secondary hover:bg-secondary/90 text-white py-2 px-4 rounded transition-colors">
                    Costos Unitarios
                  </Link>
                  <Link href="/catalogo" className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded transition-colors">
                    Catálogo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 flex-grow">
          {children}
        </div>

        <footer className="bg-secondary text-white py-4 font-satoshi">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} GrowPals</p>
          </div>
        </footer>
      </body>
    </html>
  );
}