import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Meu Álbum — Copa 2026",
  description: "Controle de figurinhas do álbum oficial Panini FIFA World Cup 26",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-950 text-stone-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
