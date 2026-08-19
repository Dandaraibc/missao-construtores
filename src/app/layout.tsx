import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Missão Construtores | Carbono Zero",
  description: "Plataforma gamificada para os alunos construírem o aplicativo Missão Carbono Zero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-marfim text-carvao font-sans">
        {children}
      </body>
    </html>
  );
}
