import { useEffect, useRef, useState } from 'react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    backgroundColor?: string;
  }[];
}

interface AnalyticsChartProps {
  type: 'bar' | 'line' | 'doughnut' | 'area';
  data: ChartData;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

export default function AnalyticsChart({ 
  type, 
  data, 
  height = 300, 
  showLegend = true,
  showGrid = true,
  animated = true
}: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const colors = [
    { main: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    { main: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { main: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
    { main: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ];

  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    let start = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(easeOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data, animated]);

  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const minValue = 0;

    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(rect.width - padding.right, y);
        ctx.stroke();
        
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value.toLocaleString('pt-BR'), padding.left - 10, y + 4);
      }
    }

    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    data.labels.forEach((label, i) => {
      const x = padding.left + (chartWidth / (data.labels.length - 1 || 1)) * i;
      ctx.fillText(label, x, rect.height - 10);
    });

    if (type === 'bar') {
      const barWidth = (chartWidth / data.labels.length) * 0.6 / data.datasets.length;
      const groupWidth = barWidth * data.datasets.length + 10;
      
      data.datasets.forEach((dataset, datasetIndex) => {
        const color = colors[datasetIndex % colors.length];
        
        dataset.data.forEach((value, i) => {
          const barHeight = (value / maxValue) * chartHeight * animationProgress;
          const x = padding.left + (chartWidth / data.labels.length) * i + (chartWidth / data.labels.length - groupWidth) / 2 + barWidth * datasetIndex;
          const y = padding.top + chartHeight - barHeight;
          
          ctx.fillStyle = dataset.color || color.main;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        });
      });
    }

    if (type === 'line' || type === 'area') {
      data.datasets.forEach((dataset, datasetIndex) => {
        const color = colors[datasetIndex % colors.length];
        
        if (type === 'area') {
          ctx.beginPath();
          ctx.moveTo(padding.left, padding.top + chartHeight);
          
          dataset.data.forEach((value, i) => {
            const x = padding.left + (chartWidth / (data.labels.length - 1 || 1)) * i;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight * animationProgress;
            
            if (i === 0) {
              ctx.lineTo(x, y);
            } else {
              const prevX = padding.left + (chartWidth / (data.labels.length - 1)) * (i - 1);
              const cpX = (prevX + x) / 2;
              const prevY = padding.top + chartHeight - (dataset.data[i - 1] / maxValue) * chartHeight * animationProgress;
              ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
          });
          
          ctx.lineTo(rect.width - padding.right, padding.top + chartHeight);
          ctx.closePath();
          
          const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
          gradient.addColorStop(0, color.bg.replace('0.1', '0.3'));
          gradient.addColorStop(1, color.bg.replace('0.1', '0'));
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.strokeStyle = dataset.color || color.main;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        dataset.data.forEach((value, i) => {
          const x = padding.left + (chartWidth / (data.labels.length - 1 || 1)) * i;
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight * animationProgress;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = padding.left + (chartWidth / (data.labels.length - 1)) * (i - 1);
            const cpX = (prevX + x) / 2;
            const prevY = padding.top + chartHeight - (dataset.data[i - 1] / maxValue) * chartHeight * animationProgress;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
          }
        });
        ctx.stroke();

        dataset.data.forEach((value, i) => {
          const x = padding.left + (chartWidth / (data.labels.length - 1 || 1)) * i;
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight * animationProgress;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = dataset.color || color.main;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });
    }

    if (type === 'doughnut') {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
      const innerRadius = radius * 0.6;
      
      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
      let startAngle = -Math.PI / 2;
      
      data.datasets[0].data.forEach((value, i) => {
        const sliceAngle = (value / total) * Math.PI * 2 * animationProgress;
        const color = colors[i % colors.length];
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color.main;
        ctx.fill();
        
        startAngle += sliceAngle;
      });

      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(total.toLocaleString('pt-BR'), centerX, centerY);
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Total', centerX, centerY + 20);
    }
  }, [data, animationProgress, type, showGrid]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        className="block"
      />
      
      {showLegend && data.datasets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {type === 'doughnut' ? (
            data.labels.map((label, i) => (
              <div key={i} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[i % colors.length].main }}
                />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))
          ) : (
            data.datasets.map((dataset, i) => (
              <div key={i} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: dataset.color || colors[i % colors.length].main }}
                />
                <span className="text-sm text-gray-600">{dataset.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}



