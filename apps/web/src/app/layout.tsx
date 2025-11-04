import "./global.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Matar Beta - Enterprise Resource Planning Solution",
  description:
    "Modern enterprise resource planning system for streamlined business operations, employee management, and performance tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
