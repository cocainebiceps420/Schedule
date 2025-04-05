'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    } else if (status === 'authenticated' && session?.user?.role !== 'CUSTOMER') {
      router.push('/dashboard');
      return;
    }
    setLoading(false);
  }, [status, router, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your dashboard.
        </p>
      </div>
    </div>
  );
} 