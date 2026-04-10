import { useEffect, useRef, useState } from "react";

/**
 * Affiche un PDF page par page via PDF.js (CDN).
 * Chaque page est rendue dans un <canvas> — même rendu qu'un document natif.
 */
export default function PdfViewer({ url }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setPages([]);

    // Charger PDF.js depuis CDN si pas encore chargé
    function loadPdfJs(cb) {
      if (window.pdfjsLib) { cb(); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        cb();
      };
      script.onerror = () => setError("Impossible de charger PDF.js");
      document.head.appendChild(script);
    }

    loadPdfJs(async () => {
      try {
        const pdf = await window.pdfjsLib.getDocument(url).promise;
        const canvases = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
          canvases.push(canvas.toDataURL("image/png"));
        }
        setPages(canvases);
        setLoading(false);
      } catch (e) {
        setError("Erreur lors du rendu du PDF : " + e.message);
        setLoading(false);
      }
    });
  }, [url]);

  if (loading) return (
    <div style={{ padding:"2rem", textAlign:"center", color:"var(--muted)" }}>
      Chargement du PDF...
    </div>
  );

  if (error) return (
    <div style={{ padding:"1rem", color:"var(--danger)", fontSize:"0.9rem" }}>{error}</div>
  );

  return (
    <div ref={containerRef} style={{ display:"flex", flexDirection:"column", gap:"1.5rem", alignItems:"center" }}>
      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Page ${i + 1}`}
          style={{
            width: "100%",
            maxWidth: 900,
            border: "1px solid var(--border)",
            borderRadius: 4,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            display: "block",
          }}
        />
      ))}
    </div>
  );
}
