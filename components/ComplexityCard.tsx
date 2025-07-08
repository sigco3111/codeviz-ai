import React from 'react';
import { ComplexityReport } from '../types';

interface ComplexityCardProps {
  data: ComplexityReport[];
  onFunctionSelect: (report: ComplexityReport) => void;
}

const getComplexityColor = (complexity: number): string => {
  if (complexity >= 10) return 'bg-red-500 text-red-100';
  if (complexity >= 5) return 'bg-yellow-500 text-yellow-100';
  return 'bg-green-500 text-green-100';
};

const ComplexityCard: React.FC<ComplexityCardProps> = ({ data, onFunctionSelect }) => {
  if (data.length === 0) {
    return (
        <div className="text-center text-sm text-slate-500 p-4">
            코드 복잡도 데이터를 분석할 수 없습니다.
        </div>
    );
  }
  
  const topComplexFunctions = data.slice(0, 10);

  return (
    <div className="space-y-2">
      {topComplexFunctions.map((report, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-700/40 transition-colors duration-150 cursor-pointer"
          onClick={() => onFunctionSelect(report)}
          title={`파일: ${report.filePath}\n라인: ${report.line}`}
        >
          <div className="flex items-center gap-3 truncate min-w-0">
            <span 
              className={`w-7 h-7 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-bold ${getComplexityColor(report.complexity)}`}
            >
              {report.complexity}
            </span>
            <div className="truncate">
                <p className="font-medium text-slate-200 truncate">{report.functionName}</p>
                <p className="text-xs text-slate-400 truncate">{report.filePath}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplexityCard;