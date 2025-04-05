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
    } else if (status === 'authenticated' && session.user.role !== 'PROVIDER') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await fetch('/api/availability');
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

    if (status === 'authenticated' && session.user.role === 'PROVIDER') {
      fetchAvailabilities();
    }
  }, [status, session]);

  const onSubmit = async (data: AvailabilityFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/availability', {
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
    try {
      const response = await fetch(`/api/availability/${id}`, {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
        <div className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="dayOfWeek"
                  className="block text-sm font-medium text-gray-700"
                >
                  Day of Week
                </label>
                <select
                  id="dayOfWeek"
                  {...register('dayOfWeek', { valueAsNumber: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  {...register('startTime')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                {errors.startTime && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  {...register('endTime')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                {errors.endTime && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                {...register('isRecurring')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRecurring"
                className="ml-2 block text-sm text-gray-900"
              >
                Recurring weekly
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Adding...' : 'Add Availability'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Current Availability</h2>
            <div className="mt-4">
              {availabilities.length === 0 ? (
                <p className="text-gray-500">No availability slots added yet.</p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {availabilities.map((availability) => (
                      <li key={availability.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {DAYS_OF_WEEK[availability.dayOfWeek]}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
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
                            <div className="ml-2 flex-shrink-0 flex">
                              <button
                                onClick={() => handleDelete(availability.id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 