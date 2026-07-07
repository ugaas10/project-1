import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    qrCodeInstanceRef.current = html5QrCode;
    let isActive = true;

    html5QrCode.start(
      { facingMode: "environment" }, // Strictly request the back/rear camera
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      }, 
      (decodedText) => {
        if (isActive) {
          isActive = false;
          onScan(decodedText);
          html5QrCode.stop()
            .then(() => onClose())
            .catch(() => onClose());
        }
      },
      () => {
        // Silently capture scan frame updates
      }
    ).catch((err) => {
      console.warn("Failed to target environmental camera, defaulting scanner start", err);
      // Attempt generic default start as boundary fallback
      if (isActive) {
        html5QrCode.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (isActive) {
              isActive = false;
              onScan(decodedText);
              html5QrCode.stop()
                .then(() => onClose())
                .catch(() => onClose());
            }
          },
          () => {}
        ).catch((fallbackErr) => {
          console.error("QR Initialization totally failed:", fallbackErr);
        });
      }
    });

    return () => {
      isActive = false;
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {
          // Silent catch to prevent error logs on fast close/unmount
        });
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/95 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-primary/50 rounded-2xl shadow-2xl w-full max-w-sm relative z-[4001] overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar-accent/50">
          <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">QR Scanner Active</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div id="qr-reader" className="overflow-hidden rounded-xl border border-border" />
          <p className="text-[10px] text-muted-foreground text-center mt-4 uppercase font-bold tracking-[0.2em]">Align document label QR code within the frame</p>
        </div>
      </motion.div>
    </div>
  );
}

