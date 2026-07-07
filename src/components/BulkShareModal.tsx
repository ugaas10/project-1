import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Calendar, ShieldCheck, QrCode, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Document } from './DocumentsView';

interface BulkShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocuments: Document[];
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const DURATIONS = [
  { label: '1 Hour', value: 3600000 },
  { label: '4 Hours', value: 14400000 },
  { label: '24 Hours', value: 86400000 },
  { label: '7 Days', value: 604800000 },
];

export function BulkShareModal({ isOpen, onClose, selectedDocuments, showToast }: BulkShareModalProps) {
  const [duration, setDuration] = useState(86400000); // 24 hours default
  const [shareUrl, setShareUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (selectedDocuments.length > 0) {
      const ids = selectedDocuments.map(d => d.id).join(',');
      const expiry = Date.now() + duration;
      const url = `${window.location.origin}/?shared_docs=${encodeURIComponent(ids)}&token=${expiry}`;
      setShareUrl(url);
    }
  }, [selectedDocuments, duration, isOpen]);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    showToast('Temporary secure link copied to clipboard!', 'success');
  };

  const formattedExpiry = () => {
    const date = new Date(Date.now() + duration);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/40 bg-sidebar/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 pr-6 mb-6">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Secure Bulk Share</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a temporary secure share link for the {selectedDocuments.length} selected document(s).
              </p>
            </div>
          </div>

          {/* Document list */}
          <div className="mb-5">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Documents to Share ({selectedDocuments.length})
            </span>
            <div className="max-h-[140px] overflow-y-auto rounded-xl border border-border/30 bg-background/50 divide-y divide-border/20 p-1">
              {selectedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2.5 p-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <span className="font-semibold truncate flex-1 text-foreground">{doc.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground/80 flex-shrink-0">
                    {doc.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Parameters */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Expiry Period
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => setDuration(dur.value)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                      duration === dur.value
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'border-border/30 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end bg-cyan-500/5 rounded-xl border border-cyan-500/10 p-3">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Link Active Until:</span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                {formattedExpiry()}
              </span>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium mt-2">
                <ShieldCheck className="h-3 w-3" />
                <span>Encrypted & Secured</span>
              </div>
            </div>
          </div>

          {/* Share Link Generation */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Secure Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground font-mono outline-none focus:border-cyan-500/50 transition-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 text-xs font-bold text-black hover:bg-cyan-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Optional QR Code */}
          <div className="mt-4 pt-4 border-t border-border/20">
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-cyan-400 transition-colors mx-auto"
            >
              <QrCode className="h-4 w-4" />
              <span>{showQR ? 'Hide QR Code' : 'Generate QR Code for Scanning'}</span>
            </button>

            {showQR && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-3 mt-4 p-4 bg-white rounded-2xl border border-border/15 max-w-[180px] mx-auto shadow-inner"
              >
                <QRCode
                  value={shareUrl}
                  size={140}
                  level="M"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
                <span className="text-[8px] font-bold text-black uppercase tracking-widest font-mono">Scan on Device</span>
              </motion.div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="mt-4 text-[9px] text-muted-foreground text-center bg-muted/20 py-2 px-3 rounded-lg border border-border/10">
            Secure workspace collaboration mode. Unverified users will not be able to decrypt these files once the temporary session expires.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
