"use client";

// Client-side PDF generation from optimized resume text
export async function generateResumePDF(
  resumeText: string,
  candidateName?: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

  let y = margin;

  // ── Header bar ──────────────────────────────────────
  doc.setFillColor(92, 191, 21); // #5CBF15
  doc.rect(0, 0, pageW, 14, "F");

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Gerado por Currículo que Passa • curriculo-que-passa.com.br", pageW / 2, 9, { align: "center" });

  y = 22;

  // ── Parse and render resume sections ────────────────
  const lines = resumeText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      y += 3;
      continue;
    }

    // Check if new page needed
    if (y > pageH - margin) {
      doc.addPage();
      // Mini header on new pages
      doc.setFillColor(92, 191, 21);
      doc.rect(0, 0, pageW, 8, "F");
      y = 16;
    }

    // Section headers: ALL CAPS lines or lines ending with ":"
    const isSectionHeader =
      (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\d/.test(trimmed)) ||
      /^(EXPERIÊNCIA|FORMAÇÃO|HABILIDADES|COMPETÊNCIAS|RESUMO|OBJETIVO|CURSOS|CERTIFICAÇÕES|IDIOMAS|PROJETOS)/i.test(trimmed);

    if (isSectionHeader) {
      // Draw section line
      if (y > 22) y += 2;
      doc.setFillColor(219, 242, 196); // #DBF2C4
      doc.rect(margin, y - 1, contentW, 7, "F");
      doc.setFillColor(92, 191, 21);
      doc.rect(margin, y - 1, 3, 7, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 106, 4);
      doc.text(trimmed.toUpperCase(), margin + 6, y + 4);
      y += 11;
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("·")) {
      const bulletText = trimmed.replace(/^[•\-·]\s*/, "");
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 51, 51);

      // Bullet dot
      doc.setFillColor(92, 191, 21);
      doc.circle(margin + 2, y + 1.5, 1, "F");

      const wrapped = doc.splitTextToSize(bulletText, contentW - 8);
      doc.text(wrapped, margin + 6, y + 3);
      y += wrapped.length * 5 + 1;
      continue;
    }

    // Bold sub-headers (lines with company, title — usually shorter and mixed case)
    const isSubHeader = trimmed.length < 80 && /[|—–\-]/.test(trimmed);
    if (isSubHeader) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(trimmed, margin, y + 3);
      y += 7;
      continue;
    }

    // Regular paragraph text
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(trimmed, contentW);
    doc.text(wrapped, margin, y + 3);
    y += wrapped.length * 5 + 1;
  }

  // ── Footer ───────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(170, 170, 170);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Pág. ${i} de ${totalPages}`,
      pageW - margin,
      pageH - 8,
      { align: "right" }
    );
    doc.text(
      "Otimizado com IA por Currículo que Passa",
      margin,
      pageH - 8
    );
  }

  const filename = candidateName
    ? `curriculo-${candidateName.toLowerCase().replace(/\s+/g, "-")}-otimizado.pdf`
    : "curriculo-otimizado.pdf";

  doc.save(filename);
}
