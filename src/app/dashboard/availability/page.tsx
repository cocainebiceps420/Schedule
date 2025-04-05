'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse } from 'date-fns';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isRecurring: z.boolean().default(true),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const dynamic = 'force-dynamic';

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    } else if (status === 'authenticated' && session?.user?.role !== 'PROVIDER') {
      router.push('/dashboard');
      return;
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!session?.user || session.user.role !== 'PROVIDER') {
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const response = await fetch(`${baseUrl}/api/availability`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailabilities(data);
        }
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, [session]);

  const onSubmit = async (data: AvailabilityFormData) => {
    if (!session?.user || session.user.role !== 'PROVIDER') {
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newAvailability = await response.json();
        setAvailabilities([...availabilities, newAvailability]);
        reset();
      } else {
        console.error('Error creating availability');
      }
    } catch (error) {
      console.error('Error creating availability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user || session.user.role !== 'PROVIDER') {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/availability/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvailabilities(availabilities.filter((a) => a.id !== id));
      } else {
        console.error('Error deleting availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set your available time slots for appointments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Day of Week
            </label>
            <select
              {...register('dayOfWeek', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dayOfWeek.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              {...register('startTime')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="time"
              {...register('endTime')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Recurring
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Availability'}
          </button>
        </div>
      </form>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {availabilities.map((availability) => (
            <li key={availability.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {DAYS_OF_WEEK[availability.dayOfWeek]}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(
                      parse(availability.startTime, 'HH:mm', new Date()),
                      'h:mm a'
                    )}{' '}
                    -{' '}
                    {format(
                      parse(availability.endTime, 'HH:mm', new Date()),
                      'h:mm a'
                    )}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(availability.id)}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 