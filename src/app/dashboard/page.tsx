'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          You are logged in as a {session?.user?.role?.toLowerCase()}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {session?.user?.role === 'PROVIDER' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Manage Services
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add, edit, or remove your services
                  </p>
                  <div className="mt-4">
                    <a
                      href="/dashboard/services"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      View Services →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Availability
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Set your working hours and availability
                  </p>
                  <div className="mt-4">
                    <a
                      href="/dashboard/availability"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      Manage Availability →
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Bookings
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                View and manage your appointments
              </p>
              <div className="mt-4">
                <a
                  href="/dashboard/bookings"
                  className="text-blue-600 hover:text-blue-500"
                >
                  View Bookings →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 