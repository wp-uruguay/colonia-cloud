import type { Metadata } from "next";
import InstagramAnalyzer from "./InstagramAnalyzer";

export const metadata: Metadata = {
  title: "Analizador de Instagram",
  description:
    "Analiza el engagement de cualquier cuenta de Instagram, detecta shadowban y obtene metricas clave como ratio followers/following y frecuencia de publicacion.",
};

export default function InstagramAnalyzerPage() {
  return (
    <main>
      <InstagramAnalyzer />
    </main>
  );
}
