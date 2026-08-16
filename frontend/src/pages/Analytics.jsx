import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Award, Award as Medal } from 'lucide-react';
import { Card } from '../components/Card';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics = () => {
  // Mock ATS trends
  const lineData = {
    labels: ['Scan 1', 'Scan 2', 'Scan 3', 'Scan 4', 'Scan 5', 'Scan 6'],
    datasets: [
      {
        label: 'ATS Compliance Score',
        data: [45, 52, 60, 68, 75, 84],
        fill: true,
        borderColor: '#14b8a6', // teal-500
        backgroundColor: 'rgba(20, 184, 166, 0.08)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#0f172a',
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 11 },
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(30, 41, 59, 0.3)',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(30, 41, 59, 0.3)',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
        }
      }
    }
  };

  // Mock Skill gaps occurrences
  const barData = {
    labels: ['Docker', 'AWS', 'FastAPI', 'Kubernetes', 'TypeScript', 'Jest'],
    datasets: [
      {
        label: 'Gap Frequency across target jobs',
        data: [80, 65, 55, 45, 30, 20],
        backgroundColor: 'rgba(99, 102, 241, 0.75)', // indigo-500
        hoverBackgroundColor: '#6366f1',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 11 },
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(30, 41, 59, 0.3)',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
          callback: (value) => `${value}%`
        }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Optimization Velocity" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">+39% Score Delta</p>
              <p className="text-[10px] text-slate-500">Comparison of first scan vs latest</p>
            </div>
          </div>
        </Card>

        <Card title="Skill Expansion" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">12 Technologies Added</p>
              <p className="text-[10px] text-slate-500">Keywords indexed in CV records</p>
            </div>
          </div>
        </Card>

        <Card title="Best Practice Evaluation" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">Level: Intermediate</p>
              <p className="text-[10px] text-slate-500">Interview simulator compliance level</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="ATS Trend Improvement" subtitle="Historical score progression graph">
          <div className="h-64 mt-4 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </Card>

        <Card title="Frequent Requirement Gaps" subtitle="Skill deficiencies identified in target jobs">
          <div className="h-64 mt-4 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Analytics;
