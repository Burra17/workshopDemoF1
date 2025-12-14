import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { PredictionResult } from '../types';

interface AnalysisChartProps {
  result: PredictionResult;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ result }) => {
  const data = [
    {
      name: 'Historical',
      uv: result.rawStats.historicalScore * 10, // Scale to 100
      fill: '#dc2626', // Red-600
    },
    {
      name: 'Recent Form',
      uv: result.rawStats.recentFormScore * 10, // Scale to 100
      fill: '#f59e0b', // Amber-500
    },
    {
      name: 'Win Prob',
      uv: result.probability,
      fill: '#10b981', // Emerald-500
    },
  ];

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          barSize={20} 
          data={data}
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            dataKey="uv"
          />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ color: '#e2e8f0' }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            itemStyle={{ color: '#f1f5f9' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};