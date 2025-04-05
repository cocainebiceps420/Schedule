'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.role !== 'PROVIDER') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session.user.role === 'PROVIDER') {
      fetchServices();
    }
  }, [status, session]);

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(services.filter((service) => service.id !== serviceId));
      } else {
        console.error('Error deleting service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Services</h1>
          <button
            onClick={() => router.push('/dashboard/services/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add New Service
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {service.description}
                </p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Duration: {service.duration} minutes
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ${service.price}
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/services/${service.id}/edit`)
                    }
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 