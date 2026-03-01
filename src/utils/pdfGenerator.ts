import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ServiceOrder, CompanyInfo } from '@/types';

const COLORS = {
  dark: [15, 23, 42] as [number, number, number],
  primary: [56, 189, 248] as [number, number, number],
  accent: [0, 200, 150] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [248, 250, 252] as [number, number, number],
  midGray: [148, 163, 184] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  borderLight: [226, 232, 240] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
};

const statusConfig = {
  open: { label: 'ABERTA', color: COLORS.warning },
  in_progress: { label: 'EM ANDAMENTO', color: COLORS.blue },
  completed: { label: 'CONCLUÍDA', color: COLORS.success },
  cancelled: { label: 'CANCELADA', color: COLORS.danger },
};

const priorityConfig = {
  low: { label: 'Baixa', color: COLORS.success },
  medium: { label: 'Média', color: COLORS.warning },
  high: { label: 'Alta', color: COLORS.danger },
};

function drawHeader(doc: jsPDF, company: CompanyInfo) {
  // Top accent line
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 210, 3, 'F');

  // Header background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 3, 210, 32, 'F');

  // Company name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'GPSXPRESS', 14, 17);

  // Tagline / subtitle
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.accent);
  doc.text('RASTREAMENTO & TECNOLOGIA', 14, 23);

  // Company details right side
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.midGray);
  const rightX = 196;
  let lineY = 13;
  
  if (company.nif) {
    doc.text(`NIF: ${company.nif}`, rightX, lineY, { align: 'right' });
    lineY += 4;
  }
  if (company.ie) {
    doc.text(`IE: ${company.ie}`, rightX, lineY, { align: 'right' });
    lineY += 4;
  }
  if (company.phone) {
    doc.text(company.phone, rightX, lineY, { align: 'right' });
    lineY += 4;
  }
  if (company.email) {
    doc.text(company.email, rightX, lineY, { align: 'right' });
    lineY += 4;
  }
  if (company.address) {
    doc.text(`${company.address}, ${company.provincia}/${company.municipio} - ${company.rua}`, rightX, lineY, { align: 'right' });
  }

  // Divider line
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(14, 37, 196, 37);

  doc.setTextColor(0, 0, 0);
}

function drawFooter(doc: jsPDF, company: CompanyInfo) {
  const h = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.3);
  doc.line(14, h - 18, 196, h - 18);

  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.midGray);
  doc.text(
    `${company.name || 'GPSXPRESS'} • Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    105, h - 12, { align: 'center' }
  );
  doc.text('Este documento é válido como comprovante de serviço.', 105, h - 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

function drawStatusBadge(doc: jsPDF, status: ServiceOrder['status'], x: number, y: number) {
  const cfg = statusConfig[status];
  const w = doc.getTextWidth(cfg.label) + 8;
  
  doc.setFillColor(...cfg.color);
  doc.roundedRect(x, y - 4, w, 6, 1, 1, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(cfg.label, x + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...COLORS.dark);
  doc.roundedRect(14, y, 182, 7, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text(title, 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  return y + 10;
}

function drawInfoRow(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textMuted);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textDark);
  doc.text(value || '—', x, y + 5);
}

export function exportSingleOrderPDF(o: ServiceOrder, company: CompanyInfo) {
  const doc = new jsPDF();
  drawHeader(doc, company);

  // Document title bar
  let y = 42;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);
  doc.text(`ORDEM DE SERVIÇO`, 20, y + 7);
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.accent);
  doc.text(`#${o.number}`, 85, y + 7);

  // Client name in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Cliente: ${o.clientName}`, 20, y + 14);

  // Status badge
  drawStatusBadge(doc, o.status, 150, y + 7);

  // Info grid
  y = 60;
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'S');

  // Left column
  drawInfoRow(doc, 'Cliente', o.clientName, 20, y + 7);
  drawInfoRow(doc, 'Técnico', o.technicianName || '—', 20, y + 20);

  // Center column
  drawInfoRow(doc, 'Produto/Equipamento', o.productName || '—', 85, y + 7);
  drawInfoRow(doc, 'Prioridade', priorityConfig[o.priority].label, 85, y + 20);

  // Right column
  drawInfoRow(doc, 'Data de Abertura', new Date(o.createdAt).toLocaleDateString('pt-BR'), 150, y + 7);
  if (o.completedAt) {
    drawInfoRow(doc, 'Data de Conclusão', new Date(o.completedAt).toLocaleDateString('pt-BR'), 150, y + 20);
  }

  // Vertical dividers in info grid
  doc.setDrawColor(...COLORS.borderLight);
  doc.line(80, y + 3, 80, y + 29);
  doc.line(145, y + 3, 145, y + 29);

  // Content sections
  y = 98;
  const sections = [
    { title: 'DESCRIÇÃO DO SERVIÇO', content: o.description },
    { title: 'DIAGNÓSTICO TÉCNICO', content: o.diagnosis },
    { title: 'SOLUÇÃO APLICADA', content: o.solution },
  ];

  sections.forEach(sec => {
    if (!sec.content) return;
    y = drawSectionTitle(doc, sec.title, y);
    
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textDark);
    const lines = doc.splitTextToSize(sec.content, 172);
    doc.text(lines, 18, y + 4);
    y += lines.length * 4.5 + 10;
  });

  // Value box
  y += 4;
  doc.setFillColor(...COLORS.dark);
  doc.roundedRect(110, y, 86, 16, 2, 2, 'F');
  
  // Accent stripe on value box
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(110, y, 3, 16, 1, 0, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.midGray);
  doc.text('VALOR TOTAL', 118, y + 6);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text(`Ao ${o.value?.toFixed(2) || '0.00'}`, 192, y + 12, { align: 'right' });

  // Signature area
  const sigY = y + 36;
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.3);
  
  // Left signature
  doc.line(14, sigY, 90, sigY);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Assinatura do Cliente', 52, sigY + 5, { align: 'center' });

  // Right signature
  doc.line(120, sigY, 196, sigY);
  doc.text('Assinatura do Técnico', 158, sigY + 5, { align: 'center' });

  drawFooter(doc, company);
  doc.setTextColor(0, 0, 0);
  doc.save(`os-${o.number}.pdf`);
}

export function exportOrdersReportPDF(orders: ServiceOrder[], company: CompanyInfo) {
  const doc = new jsPDF();
  drawHeader(doc, company);

  // Title
  let y = 44;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);
  doc.text('RELATÓRIO DE ORDENS DE SERVIÇO', 14, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`${orders.length} registro(s) • Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, y + 6);

  // Summary cards
  y += 14;
  const open = orders.filter(o => o.status === 'open').length;
  const inProgress = orders.filter(o => o.status === 'in_progress').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const total = orders.reduce((s, o) => s + (o.value || 0), 0);

  const cardW = 43;
  const summaryData = [
    { label: 'Abertas', value: String(open), color: COLORS.warning },
    { label: 'Em Andamento', value: String(inProgress), color: COLORS.blue },
    { label: 'Concluídas', value: String(completed), color: COLORS.success },
    { label: 'Faturamento', value: `Ao ${total.toFixed(2)}`, color: COLORS.accent },
  ];

  summaryData.forEach((card, i) => {
    const cx = 14 + i * (cardW + 2.5);
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(cx, y, cardW, 14, 1.5, 1.5, 'F');
    
    // Top accent
    doc.setFillColor(...card.color);
    doc.roundedRect(cx, y, cardW, 2, 1.5, 0, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(card.label, cx + cardW / 2, y + 7, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textDark);
    doc.text(card.value, cx + cardW / 2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  });

  // Table
  autoTable(doc, {
    startY: y + 20,
    head: [['Nº', 'Cliente', 'Técnico', 'Status', 'Prioridade', 'Valor (Ao)']],
    body: orders.map(o => [
      `#${o.number}`,
      o.clientName,
      o.technicianName || '—',
      statusConfig[o.status].label,
      priorityConfig[o.priority].label,
      `Ao ${o.value?.toFixed(2) || '0.00'}`,
    ]),
    styles: { fontSize: 8, cellPadding: 3, textColor: COLORS.textDark },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.accent,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold', textColor: COLORS.accent },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    foot: [['', '', '', '', 'TOTAL', `Ao ${total.toFixed(2)}`]],
    footStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.accent,
      fontStyle: 'bold',
      fontSize: 9,
    },
  });

  drawFooter(doc, company);
  doc.save('relatorio-os.pdf');
}
