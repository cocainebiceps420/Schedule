'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  bookingsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
  };
  bookingsByDay: {
    date: string;
    count: number;
    revenue: number;
  }[];
}

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState(30); // Default to last 30 days

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user || session.user.role !== 'PROVIDER') {
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const response = await fetch(`${baseUrl}/api/analytics?days=${timeRange}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session, timeRange]);

  if (status === 'loading' || loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = {
    labels: analytics.bookingsByDay.map((day) =>
      format(new Date(day.date), 'MMM d')
    ),
    datasets: [
      {
        label: 'Bookings',
        data: analytics.bookingsByDay.map((day) => day.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Revenue',
        data: analytics.bookingsByDay.map((day) => day.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Bookings and Revenue Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Bookings',
        },
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="mt-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {analytics.totalBookings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ${analytics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {analytics.averageRating.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Bookings by Status
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 