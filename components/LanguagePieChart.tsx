import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LanguageDistribution } from '../types';

interface LanguagePieChartProps {
  data: LanguageDistribution;
  activeLanguage: string | null;
  onSliceClick: (language: string | null) => void;
}

const COLORS = ['#0ea5e9', '#6366f1', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];

const LanguagePieChart: React.FC<LanguagePieChartProps> = ({ data, activeLanguage, onSliceClick }) => {
  const chartData = useMemo(() => Object.entries(data)
    .map(([name, value]) => ({ 
      name: name === 'other' ? '기타' : `.${name}`, 
      value, 
      originalName: name 
    }))
    .sort((a, b) => b.value - a.value), [data]);

  const activeIndex = useMemo(() => {
    if (!activeLanguage) return -1;
    return chartData.findIndex(d => d.originalName === activeLanguage);
  }, [chartData, activeLanguage]);

  const handleClick = (data: any, index: number) => {
    const clickedName = chartData[index].originalName;
    if (clickedName === 'other') {
      onSliceClick(null); // '기타'를 클릭하면 필터 초기화
    } else {
      onSliceClick(clickedName);
    }
  };

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">언어 데이터가 없습니다.</div>;
  }

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 5, right: 110, bottom: 5, left: 5 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius="45%"
            outerRadius="85%"
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            stroke="#1e293b"
            paddingAngle={2}
            onClick={handleClick}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                style={{ cursor: 'pointer' }}
                opacity={activeIndex !== -1 && activeIndex !== index ? 0.5 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.75rem',
            }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            iconType="circle"
            iconSize={10}
            wrapperStyle={{
                fontSize: "14px", 
                lineHeight: "24px",
                overflowY: "auto",
                maxHeight: '100%',
                paddingLeft: '10px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguagePieChart;