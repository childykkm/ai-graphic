import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CollapsibleSectionProps {
  open: boolean;
  onToggle: () => void;
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  tooltip?: string;
  children: ReactNode;
}

export function CollapsibleSection({
  open,
  onToggle,
  icon,
  iconBg,
  title,
  subtitle,
  subtitleColor = 'text-gray-400',
  tooltip,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 sm:p-8 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-[1.1rem] font-bold text-gray-800">{title}</h2>
              {tooltip && (
                <div className="group relative -mt-0.5 hidden sm:block">
                  <Info size={16} className="text-gray-300 cursor-help" />
                  <div className="absolute top-1/2 left-full ml-2 w-48 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            {subtitle && <p className={`text-sm font-medium mt-0.5 ${subtitleColor}`}>{subtitle}</p>}
          </div>
        </div>
        <div className="text-gray-400">
          {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-100/60 mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
