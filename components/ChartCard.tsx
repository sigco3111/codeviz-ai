
import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:border-sky-500/50 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      <div className="h-full">{children}</div>
    </div>
  );
};

export default ChartCard;
