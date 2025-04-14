'use client';

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Script para evitar el parpadeo al cargar la página
          (function() {
            // Verificar la preferencia guardada en localStorage
            const storedTheme = localStorage.getItem('theme');
            // Verificar la preferencia del sistema operativo
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // Aplicar clase 'dark' al html si es necesario
            if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })();
        `,
      }}
    />
  );
}