import './globals.css';
import { interTight, inter, satoshi } from './config/fonts';
import Link from 'next/link';
import { ThemeProvider } from './components/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import Image from 'next/image';
export const metadata = {
  title: 'Presupuesto',
  description: 'Una aplicación para gestionar inventario con estilo GrowPals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${interTight.variable} ${inter.variable} ${satoshi.variable}`}>
      <body className="bg-background-light dark:bg-background-dark text-primary min-h-screen">
        <ThemeProvider>
          <header className="bg-secondary dark:bg-secondary text-white py-4">
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
                    <ThemeToggle />
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

          <div className="container mx-auto px-4 py-6">
            {children}
          </div>

          <footer className="bg-secondary dark:bg-gray-800 text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p>© {new Date().getFullYear()} GrowPals</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}