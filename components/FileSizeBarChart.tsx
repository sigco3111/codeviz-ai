import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface FileSizeBarChartProps {
  data: { name: string; path: string; size: number }[];
  onBarClick: (path: string) => void;
}

const FileSizeBarChart: React.FC<FileSizeBarChartProps> = ({ data, onBarClick }) => {
  const topFiles = data
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(file => ({...file, size: Math.round(file.size / 1024 * 10) / 10})); // convert to KB

  const handleBarClick = (chartData: any) => {
    if (chartData && chartData.activePayload && chartData.activePayload.length > 0) {
      const path = chartData.activePayload[0].payload.path;
      onBarClick(path);
    }
  };

  if (topFiles.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">파일 데이터가 없습니다.</div>;
  }

  return (
    <div className="w-full h-72 sm:h-80 file-size-bar-chart">
      <ResponsiveContainer>
        <BarChart 
          data={topFiles} 
          layout="vertical" 
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" unit=" KB"/>
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 16)}...` : value}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.75rem',
            }}
            formatter={(value: number) => [`${value} KB`, '크기']}
          />
          <Bar dataKey="size" fill="#0ea5e9" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FileSizeBarChart;