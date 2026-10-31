import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, CheckCircle2, Mail, X } from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';

export const CelebrationModal: React.FC = () => {
  const { celebration, closeCelebration } = useSubscriptions();

  if (!celebration || !celebration.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center overflow-hidden"
        >
          {/* Top subtle decorative ambient glow */}
          <div
            className={`absolute -top-16 -left-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
              celebration.type === 'cancellation'
                ? 'bg-emerald-500'
                : celebration.type === 'congratulations'
                ? 'bg-indigo-500'
                : 'bg-blue-500'
            }`}
          />
          <div
            className={`absolute -bottom-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
              celebration.type === 'cancellation'
                ? 'bg-amber-400'
                : celebration.type === 'congratulations'
                ? 'bg-rose-500'
                : 'bg-emerald-500'
            }`}
          />

          {/* Close button */}
          <button
            onClick={closeCelebration}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="flex justify-center mb-4">
            {celebration.type === 'cancellation' && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            )}

            {celebration.type === 'congratulations' && (
              <motion.div
                initial={{ scale: 0, rotate: 30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"
              >
                <ShieldCheck className="w-8 h-8" />
              </motion.div>
            )}

            {celebration.type === 'emailSent' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm"
              >
                <Mail className="w-8 h-8" />
              </motion.div>
            )}
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {celebration.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {celebration.subtitle}
          </p>

          {/* Highlight Stat / Amount */}
          {celebration.amount && (
            <div className="py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 inline-block mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 block mb-0.5">
                {celebration.type === 'cancellation' ? 'Money Preserved' : 'Renewal Value'}
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {celebration.amount}
              </span>
            </div>
          )}

          {celebration.extraInfo && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mb-5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{celebration.extraInfo}</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={closeCelebration}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Got it, continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
