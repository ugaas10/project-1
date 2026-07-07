import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, Trash2, X, Info, Lock } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface HighStakesDeleteAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subTab: 'active' | 'deleted';
  totalCount: number;
}

export function HighStakesDeleteAllModal({
  isOpen,
  onClose,
  onConfirm,
  subTab,
  totalCount
}: HighStakesDeleteAllModalProps) {
  const { t } = useLanguage();
  const currentLang = t('language') === 'so' ? 'so' : 'en';

  const [confirmText, setConfirmText] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');

  const requiredPhrase = currentLang === 'so' ? 'TIRTIR DHAMMAAN' : 'DELETE ALL';

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setCountdown(3);
      setError('');
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const isPhraseMatch = confirmText.trim() === requiredPhrase;
  const isButtonEnabled = isPhraseMatch && countdown === 0;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return;
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* High stakes container modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#0d0f14] border-2 border-rose-600/50 shadow-[0_0_50px_rgba(225,29,72,0.15)] rounded-2xl overflow-hidden z-[1102] text-white"
        >
          {/* Top warning status banner */}
          <div className="bg-rose-950/40 border-b border-rose-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse shrink-0" />
              <span className="text-xs font-black tracking-widest text-rose-400 uppercase font-mono">
                {currentLang === 'so' ? 'DEMBI MAAMULE: FAL HALIS AH' : 'ADMIN COMMAND: DANGER HIGH-STAKES'}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning description block */}
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Trash2 className="w-7 h-7 text-rose-500 shrink-0" />
                {currentLang === 'so' 
                  ? `Tirtirista Dhammaan Dukumiintiyada (${totalCount})` 
                  : `Destructive Clearance of All Documents (${totalCount})`
                }
              </h3>
              
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 text-xs leading-relaxed space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block uppercase tracking-wider mb-1">
                      {currentLang === 'so' ? 'DIGNIIN XAASASI AH' : 'CRITICAL WARNING'}
                    </span>
                    {subTab === 'active' ? (
                      currentLang === 'so'
                        ? 'Waxaad qarka u saaran tahay inaad gasho khasnadda KMG ah dhammaan dukumiintiyada firfircoon ee nidaamka ku jira. Qof kasta oo kale wuxuu waayi doonaa helitaanka dukumiintiyadan si ku-meel-gaar ah.'
                        : 'You are about to move ALL active files in the system database directly to the Deleted Archive. Users will lose immediate visibility of these documents.'
                    ) : (
                      currentLang === 'so'
                        ? 'Tallaabadani waa mid joogto ah oo aan marnaba dib loo celin karin! Dhammaan dukumiintiyada la kaydiyay si joogto ah ayaa looga tirtiri doonaa Firestore Cloud Storage.'
                        : 'This operation is permanent and absolute! It cannot be undone under any circumstances. This will permanently purge and erase all archived documents from Firestore and storage.'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Input Confirmation form */}
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  {currentLang === 'so' 
                    ? `Fadlan qor "${requiredPhrase}" si aad u sii waddo:` 
                    : `Type "${requiredPhrase}" in all caps to unlock the administrative bypass:`
                  }
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={requiredPhrase}
                    className="w-full bg-[#141721] border border-gray-800 focus:border-rose-500 rounded-xl px-4 py-3.5 text-center font-mono font-bold text-lg text-white tracking-widest placeholder-gray-700 outline-none transition-all shadow-inner focus:ring-1 focus:ring-rose-500"
                    autoFocus
                    autoComplete="off"
                  />
                  {isPhraseMatch && (
                    <motion.div 
                      initial={{ scale: 0.8 }} 
                      animate={{ scale: 1 }} 
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500"
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 order-2 sm:order-1 px-5 py-3.5 rounded-xl border border-gray-800 bg-[#141721] hover:bg-gray-800/50 text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors"
                >
                  {currentLang === 'so' ? 'JOOJI' : 'ABORT ACTION'}
                </button>
                <button
                  type="submit"
                  disabled={!isButtonEnabled}
                  className={`w-full sm:flex-1 order-1 sm:order-2 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    isButtonEnabled
                      ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/30 text-white cursor-pointer'
                      : 'bg-[#181a24] text-gray-600 border border-gray-900 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {countdown > 0 ? (
                    <span>
                      {currentLang === 'so' ? `SUG... (${countdown}S)` : `WAIT... (${countdown}S)`}
                    </span>
                  ) : (
                    <span>
                      {currentLang === 'so' ? 'XAQIIJI TIRTIRIS' : 'CONFIRM CLEARANCE'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Subtle bottom footer message */}
          <div className="px-6 py-3.5 bg-rose-950/20 border-t border-rose-950/40 text-[10px] font-mono text-rose-500/80 text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentLang === 'so' 
                ? 'Kaliya adeegsadayaasha leh darajada Maamule ayaa u fasaxan falkan' 
                : 'Only accounts with role "Maamulaha" can authorized this clearance.'
              }
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
