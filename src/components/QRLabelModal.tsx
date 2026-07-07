import { motion } from 'motion/react';
import { X, Printer, Download, MapPin, Calendar, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useRef } from 'react';
import { useLanguage } from '../lib/i18n';

interface QRLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export function QRLabelModal({ isOpen, onClose, project }: QRLabelModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  if (!isOpen || !project) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=900,height=900');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Label - ${project.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = () => {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw outer boundary border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw central section divider
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(270, 40);
    ctx.lineTo(270, 320);
    ctx.stroke();

    // Serialize QR code SVG to render into canvas
    const svgElement = printRef.current?.querySelector('svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw the QR Code image
        ctx.drawImage(qrImage, 40, 65, 190, 190);

        // Title and layout labels
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(project.name.toUpperCase(), 300, 75);

        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#4B5563';
        ctx.fillText(language === 'so' ? 'MUDDAHA MACLUUMAADKA MASHRIICA' : 'PROJECT ASSET MONITORING TAG', 300, 100);

        // Divider
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(300, 120);
        ctx.lineTo(560, 120);
        ctx.stroke();

        // Location Info
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(language === 'so' ? 'Gobolka/Degmada:' : 'Location:', 300, 155);
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText(project.location, 300, 175);

        // Date Info
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(language === 'so' ? 'Taariikhda la Diiwaangeliyey:' : 'Registration Date:', 300, 210);
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText(project.date, 300, 230);

        // Documents Info
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(language === 'so' ? 'Dukumentiyada Nidaamsan:' : 'Systems & Documentation:', 300, 265);
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText(language === 'so' ? `${project.docs || 0} Dokumentiyo daryeelan` : `${project.docs || 0} Active Project Files`, 300, 285);

        // UID print
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#6B7280';
        ctx.fillText(`ID: ${project.id || 'N/A'} | ARCHIVE-TRACK-CODE`, 300, 325);

        // Save
        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.id = "hidden-download-qr-link";
        downloadLink.href = png;
        downloadLink.download = `${project.name.replace(/\s+/g, '_')}_QR_Asset_Label.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobURL);
      };
      qrImage.src = blobURL;
    }
  };

  return (
    <div id="qr-label-modal-overlay" className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <motion.div 
        id="qr-label-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
      />
      <motion.div 
        id="qr-label-modal-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg relative z-[5001] overflow-hidden"
      >
        <div id="qr-label-modal-header" className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 id="qr-label-modal-title" className="text-xl font-bold text-white tracking-tight">
              {language === 'so' ? 'Sumadda QR ee Mashruuca' : 'QR Asset Label'}
            </h3>
            <p id="qr-label-modal-subtitle" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
              {language === 'so' ? 'Calaamadaynta dukumintiyada jirka ee mashruuca' : 'Physical document identification tag'}
            </p>
          </div>
          <button id="qr-label-modal-close-btn" onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="qr-label-modal-body" className="p-8">
           {/* Label Preview */}
           <div id="qr-label-preview-wrapper" className="flex justify-center mb-8">
              <div id="qr-label-print-area" ref={printRef} className="bg-white p-8 rounded-lg shadow-inner text-black w-[400px] border border-gray-200">
                 <div className="flex gap-6">
                    <div id="qr-image-holder" className="bg-white p-2 border border-gray-100 rounded">
                      <QRCode 
                        value={`GEODMS-PROJECT-${project.id}-${project.name}`}
                        size={120}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                       <div className="border-b-2 border-black pb-1">
                          <h4 className="text-sm font-black uppercase tracking-tighter truncate">{project.name}</h4>
                          <p className="text-[8px] font-bold text-gray-500 uppercase">
                            {language === 'so' ? 'Waraaqaha Aqoonsiga Mashruuca' : 'Project Asset Tag'}
                          </p>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[10px]">
                             <MapPin className="w-3 h-3 min-w-[12px] text-gray-700" />
                             <span className="truncate">{project.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                             <Calendar className="w-3 h-3 min-w-[12px] text-gray-700" />
                             <span>{project.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                             <FileText className="w-3 h-3 min-w-[12px] text-gray-700" />
                             <span>
                               {language === 'so' ? `${project.docs} Dukuminti` : `${project.docs} Processed Docs`}
                             </span>
                          </div>
                       </div>
                       <div className="mt-2 pt-2 border-t border-dotted border-gray-300">
                          <p className="text-[7px] font-mono leading-tight">ID: {project.id || 'N/A'}-GEN</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div id="qr-label-modal-controls" className="grid grid-cols-2 gap-4">
              <button 
                id="qr-label-print-btn"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                 <Printer className="w-4 h-4" /> 
                 {language === 'so' ? 'Daabac Warqada' : 'Print Label'}
              </button>
              <button 
                id="qr-label-download-btn"
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 bg-sidebar border border-border text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all hover:scale-[1.02]"
              >
                 <Download className="w-4 h-4" /> 
                 {language === 'so' ? 'La soo deg PNG' : 'Download PNG'}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
