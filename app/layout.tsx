import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Supletivo Brasil — Você parou. Mas não acabou.',
  description:
    'Retome o capítulo que ficou em aberto. Conclua o Ensino Médio ou Fundamental EJA no seu ritmo, com preparação a distância, prova presencial oficial e diploma válido em todo o Brasil (Lei 9.394/96).',
  openGraph: {
    title: 'Supletivo Brasil — Você parou. Mas não acabou.',
    description:
      'A vida pediu pausas, mas sua história não acabou. Conclua seus estudos na modalidade EJA com certificação oficial válida em todo o Brasil.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supletivo Brasil — Você parou. Mas não acabou.',
    description:
      'Retome seus estudos no seu ritmo e conquiste seu diploma oficial EJA válido em todo o Brasil.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
