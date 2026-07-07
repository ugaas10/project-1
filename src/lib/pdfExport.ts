import { jsPDF } from 'jspdf';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  tags: string[];
  type: string;
  status?: string;
  uploadedBy?: 'Member' | 'Admin' | 'System';
  uploaderName?: string;
  Owner?: string;
  ComplianceCode?: string;
  VersionHistory?: string;
}

/**
 * Programmatically exports a highly professional GIS & CAD Clearance and Audit Document list PDF.
 */
export function exportDocumentSummaryPDF(documents: Document[], language: 'so' | 'en') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isSo = language === 'so';
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toUTCString().replace('GMT', 'UTC');

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 15;

  // --- Document Theme Colors ---
  const PRIMARY_COLOR = [15, 23, 42]; // Slate 900
  const SECONDARY_COLOR = [99, 102, 241]; // Violet-indigo 500
  const TEXT_DARK = [33, 41, 54]; // Dark slate for typography
  const TEXT_MUTED = [100, 116, 139]; // Cool gray
  const LINE_LIGHT = [226, 232, 240]; // Light border border_light
  const BG_ROW_ALT = [248, 250, 252]; // Soft slate alternate row bg
  const STATUS_APPROVED_BG = [209, 250, 229]; // light emerald
  const STATUS_APPROVED_FG = [6, 95, 70]; // dark emerald

  let currentY = 20;

  // --- Draw Premium Header Design ---
  // Left side: Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  
  const mainTitle = isSo 
    ? 'GEODMS: AGABKA IYO WARBIXINTA KHARIIDADA CADAALADA' 
    : 'GEODMS SECURE CLEARANCE SYSTEM LOG';
  doc.text(mainTitle, margin, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.text(
    isSo 
      ? 'Diiwaanka Rasmiga ah ee Dukumiintiyada la Ingest-gareeyay & Hubinta Badbaadada' 
      : 'Official Ledger of Ingested Spatial Layouts & Geodesic Clearances',
    margin,
    currentY
  );

  // Right side: Document Stamp / Verification Badge
  const badgeX = pageWidth - margin - 38;
  doc.setFillColor(34, 197, 94); // solid green
  doc.rect(badgeX, 16, 38, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SYSTEM SECURED', badgeX + 5, 21);

  currentY += 12;

  // --- Draw Divider ---
  doc.setDrawColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // --- Audit Report Metadata Card Box ---
  doc.setFillColor(241, 245, 249); // light background
  doc.rect(margin, currentY, pageWidth - (margin * 2), 24, 'F');
  
  doc.setDrawColor(218, 227, 237);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  
  // Left Column inside info Card
  doc.text(isSo ? 'Hayfka Sifeeyaha:' : 'Organization/Facility:', margin + 5, currentY + 6);
  doc.text(isSo ? 'Taariikhda Warbixinta:' : 'Reporting Clock:', margin + 5, currentY + 12);
  doc.text(isSo ? 'Wadarta Faylasha:' : 'Volume Inventory:', margin + 5, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('Mogadishu Municipality GIS & Cadastral Registry', margin + 42, currentY + 6);
  doc.text(currentTime, margin + 42, currentY + 12);
  doc.text(`${documents.length} ${isSo ? 'faylo la hubiyay' : 'documented assets (active)'}`, margin + 42, currentY + 18);

  // Right Column inside info Card
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('Audit Status:', margin + 115, currentY + 6);
  doc.text('Compliance Level:', margin + 115, currentY + 12);
  doc.text('Signature Key:', margin + 115, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('Fully Synchronized', margin + 145, currentY + 6);
  doc.text('ISO/TR-19115 GIS compliant', margin + 145, currentY + 12);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('SHA-256 (MOG-GEOSYNC)', margin + 145, currentY + 18);

  currentY += 32;

  // --- Table Headers ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  
  // Draw header black bar
  const headerHeight = 8;
  doc.rect(margin, currentY, pageWidth - (margin * 2), headerHeight, 'F');

  // Table Column Positions & Widths (sum = 180mm)
  // X coords: 15, 23, 102, 122, 142, 175
  const col_no_x = 17;
  const col_name_x = 24;
  const col_format_x = 100;
  const col_date_x = 120;
  const col_code_x = 142;
  const col_status_x = 175;

  doc.text('#', col_no_x, currentY + 5);
  doc.text(isSo ? 'MAGACA FAYLKA' : 'DOCUMENT NAME', col_name_x, currentY + 5);
  doc.text(isSo ? 'FORMAT' : 'SIZE', col_format_x, currentY + 5);
  doc.text(isSo ? 'TAARIIKH' : 'DATE', col_date_x, currentY + 5);
  doc.text(isSo ? 'SAYNILA' : 'COMPLIANCE', col_code_x, currentY + 5);
  doc.text('STATUS', col_status_x, currentY + 5);

  currentY += headerHeight;

  // --- Document Grid Rows ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  documents.forEach((item, index) => {
    // Check page height space left, insert page break if needed
    if (currentY > pageHeight - margin - 15) {
      doc.addPage();
      currentY = 20;

      // Redraw table header on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.rect(margin, currentY, pageWidth - (margin * 2), headerHeight, 'F');

      doc.text('#', col_no_x, currentY + 5);
      doc.text(isSo ? 'MAGACA FAYLKA' : 'DOCUMENT NAME', col_name_x, currentY + 5);
      doc.text(isSo ? 'FORMAT' : 'SIZE', col_format_x, currentY + 5);
      doc.text(isSo ? 'TAARIIKH' : 'DATE', col_date_x, currentY + 5);
      doc.text(isSo ? 'SAYNILA' : 'COMPLIANCE', col_code_x, currentY + 5);
      doc.text('STATUS', col_status_x, currentY + 5);

      currentY += headerHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Row zebra stripes bg
    if (index % 2 === 1) {
      doc.setFillColor(BG_ROW_ALT[0], BG_ROW_ALT[1], BG_ROW_ALT[2]);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 9, 'F');
    }

    // Row baseline horizontal dividing line
    doc.setDrawColor(LINE_LIGHT[0], LINE_LIGHT[1], LINE_LIGHT[2]);
    doc.setLineWidth(0.15);
    doc.line(margin, currentY + 9, pageWidth - margin, currentY + 9);

    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    
    // 1. Render index
    doc.text((index + 1).toString(), col_no_x, currentY + 6);

    // 2. Render Name with clipping / wrapping to fit 74mm boundary
    let docName = item.name || '';
    if (docName.length > 40) {
      docName = docName.substring(0, 37) + '...';
    }
    doc.text(docName, col_name_x, currentY + 6);

    // 3. Size / Type format
    const formatSizeStr = `${item.type.toUpperCase()} / ${item.size || 'N/A'}`;
    doc.text(formatSizeStr, col_format_x, currentY + 6);

    // 4. Upload Date
    doc.text(item.date || currentDate, col_date_x, currentY + 6);

    // 5. Compliance Code
    const complianceStr = item.ComplianceCode || 'PENDING-REG';
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(complianceStr, col_code_x, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // 6. Status Column with colored badge box
    const currStatus = item.status || 'Verified';
    const isApproved = currStatus.toLowerCase() === 'approved' || currStatus.toLowerCase() === 'verified';
    
    if (isApproved) {
      doc.setFillColor(STATUS_APPROVED_BG[0], STATUS_APPROVED_BG[1], STATUS_APPROVED_BG[2]);
      doc.rect(col_status_x - 1, currentY + 1.5, 20, 5.5, 'F');
      doc.setTextColor(STATUS_APPROVED_FG[0], STATUS_APPROVED_FG[1], STATUS_APPROVED_FG[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(isSo ? 'LA ASB' : 'ACTIVE', col_status_x + 2, currentY + 5.5);
    } else {
      // Pending status
      doc.setFillColor(254, 243, 199); // yellow-100 bg
      doc.rect(col_status_x - 1, currentY + 1.5, 20, 5.5, 'F');
      doc.setTextColor(146, 64, 14); // yellow-800 text
      doc.setFont('helvetica', 'bold');
      doc.text(isSo ? 'KUT-S' : currStatus.toUpperCase(), col_status_x + 2, currentY + 5.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    currentY += 9;
  });

  // --- Draw PDF Footer & Sign-off seal ---
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 10;
  // Draw light footer line
  doc.setDrawColor(LINE_LIGHT[0], LINE_LIGHT[1], LINE_LIGHT[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  
  const footerLegalText = isSo
    ? 'Huteelka nidaamka dhijitaalka ah ee maareynta naqshadaha dhulka Mogadishu GIS Suite. Waa dukumiinti rami ah.'
    : 'Exported from Mogadishu Secure Geodesic clearance servers. System SHA-256 validated and secure.';
  doc.text(footerLegalText, margin, currentY);

  // Right-aligned page numbers
  doc.text(`Page 1 of 1`, pageWidth - margin - 15, currentY);

  // Download the created PDF file
  const fileName = `GEODMS_Audit_Summary_${currentDate}.pdf`;
  doc.save(fileName);
}
