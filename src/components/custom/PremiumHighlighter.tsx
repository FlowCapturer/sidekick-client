import { Crown } from 'lucide-react';

interface IPremiumHighlighter {
  children?: React.ReactNode;
}

const PremiumHighlighter = ({ children }: IPremiumHighlighter) => {
  return (
    <span
      className={`premium-icon-wrapper relative inline-flex items-center ${
        children ? 'gap-1' : ''
      } px-1.5 py-1.5 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 bg-[length:200%_200%] text-xs font-semibold text-white transition-all duration-300 ease-in-out overflow-hidden hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] dark:from-amber-900 dark:via-amber-700 dark:to-amber-600 dark:bg-[length:200%_200%]`}
    >
      <Crown size={14} className="premium-crown relative z-10 flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-white" strokeWidth={2.5} />
      <span className="relative z-10">{children}</span>
    </span>
  );
};

export default PremiumHighlighter;
