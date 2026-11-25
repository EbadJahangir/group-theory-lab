import { jsPDF } from 'jspdf';
import type { ReportSnapshot } from '../types/symmetry';
import { toAuthenticUnicodeMath } from '../utils/mathFormat';

function escapeCsvCell(value: string | number): string {
  const str = toAuthenticUnicodeMath(String(value));
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface FontCache {
  sans: string;
  sansBold: string;
  mono: string;
  serif: string;
}

let cachedFonts: FontCache | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function fetchFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load Unicode PDF font: ${url}`);
  }
  return arrayBufferToBase64(await res.arrayBuffer());
}

async function ensureFontsLoaded(): Promise<FontCache> {
  if (cachedFonts) return cachedFonts;
  const [sans, sansBold, mono, serif] = await Promise.all([
    fetchFontBase64('/fonts/DejaVuSans.ttf'),
    fetchFontBase64('/fonts/DejaVuSans-Bold.ttf'),
    fetchFontBase64('/fonts/DejaVuSansMono.ttf'),
    fetchFontBase64('/fonts/DejaVuSerif.ttf'),
  ]);
  cachedFonts = { sans, sansBold, mono, serif };
  return cachedFonts;
}

function registerPdfFonts(doc: jsPDF, fonts: FontCache): void {
  doc.addFileToVFS('DejaVuSans.ttf', fonts.sans);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');

  doc.addFileToVFS('DejaVuSans-Bold.ttf', fonts.sansBold);
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');

  doc.addFileToVFS('DejaVuSansMono.ttf', fonts.mono);
  doc.addFont('DejaVuSansMono.ttf', 'DejaVuSansMono', 'normal');

  doc.addFileToVFS('DejaVuSerif.ttf', fonts.serif);
  doc.addFont('DejaVuSerif.ttf', 'DejaVuSerif', 'normal');
}

interface FractionSpec {
  prefix: string;
  num: string;
  den: string;
  suffix: string;
}

function parseStackedFraction(expr: string): FractionSpec | null {
  // Match forms like "ord(a) = n / gcd(n, a)" or "|Aₙ| = n! / 2" or "ord(rᵏ) = n / gcd(n, k)"
  const eqIdx = expr.indexOf('=');
  if (eqIdx === -1) return null;
  const lhs = expr.slice(0, eqIdx + 1).trim();
  const rhs = expr.slice(eqIdx + 1).trim();
  // Only render a simple standalone single fraction on RHS cleanly
  const slashMatch = rhs.match(/^([^\s/]+(?:\([^)]*\))?)\s*\/\s*([^\s/]+(?:\([^)]*\))?)(?:\s+(in\s+.*))?$/);
  if (!slashMatch) return null;
  return {
    prefix: lhs + ' ',
    num: slashMatch[1],
    den: slashMatch[2],
    suffix: slashMatch[3] ? ` ${slashMatch[3]}` : '',
  };
}

function drawPdfFormula(
  doc: jsPDF,
  rawFormula: string,
  margin: number,
  y: number,
  maxLineWidth: number,
  ensureSpace: (needed: number) => void
): number {
  const rawParts = rawFormula.split(';').map((p) => p.trim()).filter(Boolean);
  let cursorY = y;

  for (const rawPart of rawParts) {
    // Special layout for Euler totient product formula: φ(n) = n · ∏_{p | n} (1 - 1/p)
    const prodMatch = rawPart.match(/^(.*?)(∏_\{([^}]+)\})\s*\(1\s*-\s*1\/([a-zA-Z0-9]+)\)(.*)$/);
    if (prodMatch) {
      ensureSpace(40);
      const before = toAuthenticUnicodeMath(prodMatch[1]);
      const cond = toAuthenticUnicodeMath(prodMatch[3].replace(/\|/g, '∣'));
      const denom = toAuthenticUnicodeMath(prodMatch[4]);
      const after = toAuthenticUnicodeMath(prodMatch[5]);

      const midY = cursorY + 6;
      doc.setFont('DejaVuSerif', 'normal');
      doc.setTextColor(35, 42, 36);

      doc.setFontSize(10.5);
      let x = margin;
      doc.text(before, x, midY + 3);
      x += doc.getTextWidth(before);

      // Draw large ∏ with p ∣ n centered beneath
      doc.setFontSize(15);
      const prodChar = '∏';
      const prodW = doc.getTextWidth(prodChar);
      doc.text(prodChar, x, midY + 4);

      doc.setFontSize(7.5);
      const condW = doc.getTextWidth(cond);
      const subCenterX = x + prodW / 2;
      doc.text(cond, subCenterX - condW / 2, midY + 13);
      x += Math.max(prodW, condW) + 5;

      // Draw (1 - 1/p) with stacked fraction bar
      doc.setFontSize(10.5);
      const openText = '(1 - ';
      doc.text(openText, x, midY + 3);
      x += doc.getTextWidth(openText);

      const numW = doc.getTextWidth('1');
      const denW = doc.getTextWidth(denom);
      const barW = Math.max(numW, denW) + 6;
      const fracCenterX = x + barW / 2;
      doc.setFontSize(9);
      doc.text('1', fracCenterX - doc.getTextWidth('1') / 2, midY - 2.5);
      doc.setDrawColor(55, 59, 53);
      doc.setLineWidth(0.7);
      doc.line(x, midY, x + barW, midY);
      doc.text(denom, fracCenterX - doc.getTextWidth(denom) / 2, midY + 9.5);
      x += barW + 2;

      doc.setFontSize(10.5);
      doc.text(`)${after}`, x, midY + 3);
      cursorY += 34;
      continue;
    }

    const part = toAuthenticUnicodeMath(rawPart);
    const frac = parseStackedFraction(part);
    if (frac) {
      ensureSpace(34);
      doc.setFont('DejaVuSerif', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(35, 42, 36);

      const prefixW = doc.getTextWidth(frac.prefix);
      const numW = doc.getTextWidth(frac.num);
      const denW = doc.getTextWidth(frac.den);
      const barW = Math.max(numW, denW) + 8;

      const fracCenterX = margin + prefixW + barW / 2;
      const midY = cursorY + 4;

      doc.text(frac.prefix, margin, midY + 3);
      doc.text(frac.num, fracCenterX - numW / 2, midY - 3);
      doc.setDrawColor(55, 59, 53);
      doc.setLineWidth(0.75);
      doc.line(margin + prefixW, midY, margin + prefixW + barW, midY);
      doc.text(frac.den, fracCenterX - denW / 2, midY + 10.5);

      if (frac.suffix) {
        doc.text(frac.suffix, margin + prefixW + barW + 4, midY + 3);
      }
      cursorY += 30;
    } else {
      doc.setFont('DejaVuSerif', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(35, 42, 36);
      const fLines = doc.splitTextToSize(part, maxLineWidth);
      ensureSpace(fLines.length * 14);
      doc.text(fLines, margin, cursorY);
      cursorY += fLines.length * 14 + 4;
    }
  }
  return cursorY;
}

export async function exportReportPdf(report: ReportSnapshot): Promise<void> {
  const fonts = await ensureFontsLoaded();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  registerPdfFonts(doc, fonts);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 50;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 48;
    }
  };

  // Header
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(55, 59, 53);
  doc.text('GroupTheory Lab — Mathematical Verification Report', margin, y);
  y += 20;

  doc.setFont('DejaVuSans', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(82, 107, 88);
  doc.text(
    `Interactive Abstract Algebra Explorer  |  Generated ${new Date(report.createdAt).toLocaleString()}`,
    margin,
    y
  );
  y += 14;

  doc.setDrawColor(200, 211, 189);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Subject & Inputs
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(55, 59, 53);
  doc.text(toAuthenticUnicodeMath(report.title), margin, y);
  y += 18;

  doc.setFont('DejaVuSans', 'normal');
  doc.setFontSize(10);
  doc.text(`Subject: ${toAuthenticUnicodeMath(report.groupOrSubject)}`, margin, y);
  y += 15;
  doc.text(`Inputs: ${toAuthenticUnicodeMath(report.inputsSummary)}`, margin, y);
  y += 20;

  // Summary
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(11);
  doc.text('Calculated Summary', margin, y);
  y += 15;
  doc.setFont('DejaVuSans', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(toAuthenticUnicodeMath(report.summary), maxLineWidth);
  ensureSpace(summaryLines.length * 14);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 12;

  // Formulas
  if (report.formulas.length > 0) {
    ensureSpace(40);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(11);
    doc.text('Mathematical Formulas', margin, y);
    y += 16;
    for (const f of report.formulas) {
      y = drawPdfFormula(doc, f, margin, y, maxLineWidth, ensureSpace);
    }
    y += 6;
  }

  // Verification Results
  if (report.verificationLines.length > 0) {
    ensureSpace(36);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(11);
    doc.text('Verification & Reasoning', margin, y);
    y += 15;
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(9.5);
    for (const v of report.verificationLines) {
      const vLines = doc.splitTextToSize(`• ${toAuthenticUnicodeMath(v)}`, maxLineWidth);
      ensureSpace(vLines.length * 13.5);
      doc.text(vLines, margin, y);
      y += vLines.length * 13.5 + 3;
    }
    y += 10;
  }

  // Table
  if (report.tableHeaders.length > 0 && report.tableRows.length > 0) {
    ensureSpace(50);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(11);
    doc.text('Calculated Dataset', margin, y);
    y += 16;

    const colCount = report.tableHeaders.length;
    const colWidth = maxLineWidth / colCount;

    const drawRow = (cells: string[], isHeader: boolean) => {
      const wrapped = cells.map((cell) =>
        doc.splitTextToSize(toAuthenticUnicodeMath(String(cell)), Math.max(colWidth - 8, 28))
      );
      const maxLines = Math.max(...wrapped.map((w) => w.length));
      const rowHeight = maxLines * 12 + 8;
      ensureSpace(rowHeight);

      if (isHeader) {
        doc.setFillColor(232, 237, 227);
        doc.rect(margin, y - 10, maxLineWidth, rowHeight, 'F');
        doc.setFont('DejaVuSans', 'bold');
      } else {
        doc.setFont('DejaVuSans', 'normal');
      }
      doc.setFontSize(8.5);
      doc.setTextColor(55, 59, 53);

      wrapped.forEach((lines, idx) => {
        doc.text(lines, margin + idx * colWidth + 4, y + 2);
      });

      doc.setDrawColor(216, 212, 201);
      doc.line(margin, y + rowHeight - 10, pageWidth - margin, y + rowHeight - 10);
      y += rowHeight;
    };

    drawRow(report.tableHeaders, true);
    const maxRows = Math.min(report.tableRows.length, 150);
    for (let i = 0; i < maxRows; i++) {
      drawRow(report.tableRows[i], false);
    }
    if (report.tableRows.length > maxRows) {
      ensureSpace(20);
      doc.setFont('DejaVuSans', 'normal');
      doc.setFontSize(9);
      doc.text(
        `Showing first ${maxRows} of ${report.tableRows.length} rows. Export CSV for full dataset.`,
        margin,
        y + 6
      );
    }
  }

  const safeSlug = report.groupOrSubject.replace(/[^a-zA-Z0-9_-]+/g, '_').toLowerCase();
  doc.save(`grouptheory_lab_${safeSlug}_report.pdf`);
}
