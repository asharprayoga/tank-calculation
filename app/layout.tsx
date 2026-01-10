import "./globals.css";

export const metadata = {
  title: "TankCalc — RE Mechanical",
  description: "Tank design calculator (API 650 / API 620) — internal tool Rekayasa Engineering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-[rgb(var(--re-ink))]">
        {children}
      </body>
    </html>
  );
}
