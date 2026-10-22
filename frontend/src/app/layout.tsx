import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIM-BENIH HORTI | Kementerian Pertanian Republik Indonesia',
  description: 'Sistem Informasi Manajemen Terpadu Perbenihan & Pendaftaran Varietas Hortikultura Nasional — Direktorat Jenderal Hortikultura',
  keywords: ['perbenihan hortikultura', 'kementan', 'varietas tanaman', 'bpsb', 'lssm', 'tp2vh', 'permentan 24 2025'],
  authors: [{ name: 'Direktorat Perbenihan Hortikultura, Kementan RI' }],
  icons: {
    icon: '/images/logo_kementan.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('kementan_theme', 'light');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
