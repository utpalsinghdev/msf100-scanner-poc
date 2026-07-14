import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Fingerprint } from 'lucide-react';

const MESSAGES = [
  'Uploading fingerprints securely…',
  'Scanning ridge patterns…',
  'Tracing fingerprint edges…',
  'Enhancing ridge clarity…',
  'Extracting minutiae points…',
  'Sharpening edge details…',
  'Cleaning noise from prints…',
  'Aligning fingerprint data…',
  'Almost done — saving student record…',
];

type Props = { open: boolean };

/** Full-viewport blocker (portaled to body) while create + enhance runs. */
export default function EnhancingOverlay({ open }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setMsgIndex(0);
    const id = window.setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES.length),
      2600,
    );
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearInterval(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-label="Processing fingerprints"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.preventDefault()}
    >
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-indigo-100/80 animate-ping opacity-40" />
          <span className="absolute inset-2 rounded-full border-2 border-indigo-200" />
          <span className="fp-scan absolute inset-x-3 top-3 h-0.5 rounded-full bg-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <Fingerprint
            className="relative z-10 h-14 w-14 text-indigo-600"
            strokeWidth={1.5}
          />
        </div>

        <h2 className="text-lg font-semibold text-slate-900">
          Processing fingerprints
        </h2>
        <p
          key={msgIndex}
          className="mt-2 min-h-[2.5rem] text-sm text-slate-500 transition-opacity duration-300"
        >
          {MESSAGES[msgIndex]}
        </p>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Please wait — do not close or refresh this page
        </p>
      </div>

      <style>{`
        @keyframes fp-scan {
          0% { top: 18%; opacity: 0.3; }
          50% { opacity: 1; }
          100% { top: 78%; opacity: 0.3; }
        }
        .fp-scan { animation: fp-scan 2.2s ease-in-out infinite; }
      `}</style>
    </div>,
    document.body,
  );
}
