import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for chart
// In a real implementation, this would come from an API endpoint
const mockChartData = [
  { time: '00:00', sentiment: 0.65, price: 0.072 },
  { time: '02:00', sentiment: 0.58, price: 0.071 },
  { time: '04:00', sentiment: 0.72, price: 0.073 },
  { time: '06:00', sentiment: 0.68, price: 0.074 },
  { time: '08:00', sentiment: 0.55, price: 0.072 },
  { time: '10:00', sentiment: 0.49, price: 0.070 },
  { time: '12:00', sentiment: 0.62, price: 0.071 },
  { time: '14:00', sentiment: 0.75, price: 0.075 },
  { time: '16:00', sentiment: 0.80, price: 0.078 },
  { time: '18:00', sentiment: 0.76, price: 0.077 },
  { time: '20:00', sentiment: 0.71, price: 0.076 },
  { time: '22:00', sentiment: 0.67, price: 0.075 },
];

type TimeRange = '1H' | '24H' | '7D';

export default function SentimentChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  
  // In a real implementation, this would fetch data from an API endpoint
  const { data: chartData } = useQuery({
    queryKey: ['/api/sentiment/chart', timeRange],
    queryFn: async () => {
      // This would be replaced with actual API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockChartData), 500);
      });
    }
  });
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Sentiment Analysis</h3>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '1H' ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 hover:bg-secondary/30'}`}
              onClick={() => setTimeRange('1H')}
            >
              1H
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '24H' ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 hover:bg-secondary/30'}`}
              onClick={() => setTimeRange('24H')}
            >
              24H
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '7D' ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 hover:bg-secondary/30'}`}
              onClick={() => setTimeRange('7D')}
            >
              7D
            </button>
          </div>
        </div>
        <div className="mt-4 chart-container" style={{ position: 'relative', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#6366f1" 
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
                domain={[0.06, 0.08]}
                tickFormatter={(value) => `$${value.toFixed(3)}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#10b981" 
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                labelStyle={{ color: 'white' }}
                formatter={(value, name) => {
                  if (name === 'price') return [`$${Number(value).toFixed(4)}`, 'Price'];
                  if (name === 'sentiment') return [`${(Number(value) * 100).toFixed(0)}%`, 'Sentiment'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="price" 
                stroke="#6366f1" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
                name="Price"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="sentiment" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Sentiment"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
