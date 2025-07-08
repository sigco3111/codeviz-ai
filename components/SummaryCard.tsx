import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  isRating?: boolean;
}

const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
        case 'excellent':
        case '우수':
            return 'text-green-400';
        case 'good':
        case '좋음':
            return 'text-sky-400';
        case 'fair':
        case '보통':
            return 'text-yellow-400';
        case 'needs improvement':
        case '개선 필요':
            return 'text-orange-400';
        default: return 'text-slate-200';
    }
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isRating = false }) => {
    const valueColor = isRating ? getRatingColor(value as string) : 'text-slate-100';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1">
      <h4 className="text-md font-medium text-slate-400 mb-2">{title}</h4>
      <p className={`text-4xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
};

export default SummaryCard;