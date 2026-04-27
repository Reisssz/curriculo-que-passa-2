"use client";

import { ResumeStructured } from "@/types";

export async function generateResumePDF(
  structured: ResumeStructured
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW    = doc.internal.pageSize.getWidth();
  const pageH    = doc.internal.pageSize.getHeight();
  const mL       = 18;
  const mR       = 18;
  const contentW = pageW - mL - mR;

  // Cores
  const GREEN:      [number,number,number] = [52, 168, 83];
  const GREEN_DARK: [number,number,number] = [30, 100, 50];
  const GRAY_DARK:  [number,number,number] = [30, 30, 30];
  const GRAY_MID:   [number,number,number] = [80, 80, 80];
  const GRAY_LIGHT: [number,number,number] = [140, 140, 140];
  const DIVIDER:    [number,number,number] = [220, 220, 220];

  let y = 0;

  function newPage() {
    doc.addPage();
    y = 14;
  }

  function checkPage(needed: number) {
    if (y + needed > pageH - 12) newPage();
  }

  function drawSectionHeader(title: string) {
    checkPage(12);
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN_DARK);
    doc.text(title.toUpperCase(), mL, y);

    // Linha verde sob o título
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(mL, y + 1.5, mL + contentW, y + 1.5);
    y += 6;
  }

  function drawBullet(text: string) {
    checkPage(7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_MID);
    doc.setFillColor(...GREEN);
    doc.circle(mL + 2, y + 1.2, 0.9, "F");
    const lines = doc.splitTextToSize(text, contentW - 7);
    doc.text(lines, mL + 5.5, y + 3);
    y += lines.length * 4.5 + 1;
  }

  // ── CABEÇALHO ─────────────────────────────────────────────
  const { contact } = structured;

  // Fundo escuro no topo
  doc.setFillColor(...GRAY_DARK);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 33, pageW, 3, "F");

  // Nome
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const name = contact.name || "Nome do Candidato";
  doc.text(name, pageW / 2, 14, { align: "center" });

  // Linha de contato
  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.site,
  ].filter(Boolean);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  const contactLine = contactParts.join("  ·  ");
  doc.text(contactLine, pageW / 2, 22, { align: "center", maxWidth: contentW });

  y = 44;

  // ── RESUMO PROFISSIONAL ────────────────────────────────────
  if (structured.summary) {
    drawSectionHeader("Resumo Profissional");
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_MID);
    const lines = doc.splitTextToSize(structured.summary, contentW);
    doc.text(lines, mL, y);
    y += lines.length * 4.8 + 2;
  }

  // ── EXPERIÊNCIA PROFISSIONAL ───────────────────────────────
  if (structured.experiences?.length) {
    drawSectionHeader("Experiência Profissional");

    structured.experiences.forEach((exp, idx) => {
      checkPage(18);

      // Cargo
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY_DARK);
      doc.text(exp.title || "", mL, y);

      // Período alinhado à direita
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_LIGHT);
      doc.text(exp.period || "", mL + contentW, y, { align: "right" });

      y += 5;

      // Empresa
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GREEN_DARK);
      doc.text(exp.company || "", mL, y);
      y += 5;

      // Bullets
      exp.bullets?.forEach(b => drawBullet(b));

      // Separador entre experiências (exceto última)
      if (idx < structured.experiences.length - 1) {
        checkPage(4);
        doc.setDrawColor(...DIVIDER);
        doc.setLineWidth(0.2);
        doc.line(mL, y + 1, mL + contentW, y + 1);
        y += 5;
      } else {
        y += 2;
      }
    });
  }

  // ── FORMAÇÃO ACADÊMICA ────────────────────────────────────
  if (structured.education?.length) {
    drawSectionHeader("Formação Acadêmica");

    structured.education.forEach(edu => {
      checkPage(12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY_DARK);
      doc.text(edu.degree || "", mL, y);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_LIGHT);
      doc.text(edu.period || "", mL + contentW, y, { align: "right" });
      y += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GREEN_DARK);
      doc.text(edu.institution || "", mL, y);
      y += 7;
    });
  }

  // ── HABILIDADES TÉCNICAS ──────────────────────────────────
  if (structured.skills?.length) {
    drawSectionHeader("Habilidades Técnicas");
    checkPage(10);

    // Grade de badges
    const skillsPerRow = 4;
    const badgeW = contentW / skillsPerRow - 2;

    let col = 0;
    let rowY = y;

    structured.skills.forEach(skill => {
      if (col === skillsPerRow) { col = 0; rowY += 8; y = rowY; checkPage(8); }
      const bx = mL + col * (badgeW + 2);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(bx, rowY - 3, badgeW, 6.5, 1.5, 1.5, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_MID);
      doc.text(skill, bx + badgeW / 2, rowY + 1.5, { align: "center", maxWidth: badgeW - 2 });
      col++;
    });

    y = rowY + 10;
  }

  // ── COMPETÊNCIAS ──────────────────────────────────────────
  if (structured.competencies?.length) {
    drawSectionHeader("Competências");
    checkPage(8);

    // Duas colunas
    const colW = contentW / 2 - 3;
    let col    = 0;
    let rowY   = y;

    structured.competencies.forEach(comp => {
      if (col === 2) { col = 0; rowY += 6; y = rowY; checkPage(6); }
      const cx = mL + col * (colW + 6);
      doc.setFillColor(...GREEN);
      doc.circle(cx + 2, rowY + 1.2, 0.9, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_MID);
      doc.text(comp, cx + 5, rowY + 3, { maxWidth: colW - 5 });
      col++;
    });

    y = rowY + 8;
  }

  // ── IDIOMAS ───────────────────────────────────────────────
  if (structured.languages?.length) {
    drawSectionHeader("Idiomas");
    structured.languages.forEach(lang => drawBullet(lang));
    y += 2;
  }

  // ── CERTIFICAÇÕES ─────────────────────────────────────────
  if (structured.certifications?.length) {
    drawSectionHeader("Certificações");
    structured.certifications.forEach(cert => drawBullet(cert));
    y += 2;
  }

  // ── RODAPÉ ────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...GRAY_DARK);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.text(`${contact.name || ""}`, mL, pageH - 3);
    doc.text(`${i} / ${totalPages}`, pageW - mR, pageH - 3, { align: "right" });
  }

  const filename = contact.name
    ? `curriculo-${contact.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
    : "curriculo.pdf";

  doc.save(filename);
}