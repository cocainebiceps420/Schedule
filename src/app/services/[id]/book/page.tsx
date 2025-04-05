'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const bookingSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  provider: {
    id: string;
    name: string | null;
  };
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export default function BookServicePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!service) return;

      try {
        const response = await fetch(
          `/api/availability/slots?serviceId=${service.id}&date=${selectedDate.toISOString()}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    };

    fetchAvailableSlots();
  }, [service, selectedDate]);

  const onSubmit = async (data: BookingFormData) => {
    if (!service) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          providerId: service.provider.id,
          date: data.date,
          time: data.time,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/bookings');
      } else {
        console.error('Error creating booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading || !service) {
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
          Book {service.name}
        </h1>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Select Date
            </h2>
            <Calendar
              onChange={(date: Date | Date[]) => {
                if (date instanceof Date) {
                  setSelectedDate(date);
                  setValue('date', date);
                }
              }}
              value={selectedDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}
              className="border rounded-lg p-4"
            />
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Available Time Slots
                </label>
                <select
                  id="time"
                  {...register('time')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a time slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.startTime} value={slot.startTime}>
                      {format(parseISO(slot.startTime), 'h:mm a')} -{' '}
                      {format(parseISO(slot.endTime), 'h:mm a')}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.time.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  {...register('notes')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 