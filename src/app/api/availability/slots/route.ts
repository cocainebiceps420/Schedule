import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addMinutes, format, parseISO, startOfDay, endOfDay } from 'date-fns';
import type { Availability, Booking } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Get the service to get its duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }

    // Get the provider's availability for the selected day
    const selectedDate = parseISO(date);
    const dayOfWeek = selectedDate.getDay();

    const availabilities = await prisma.availability.findMany({
      where: {
        providerId: service.providerId,
        dayOfWeek,
      },
    });

    // Get existing bookings for the selected day
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: service.providerId,
        startTime: {
          gte: startOfSelectedDay,
          lte: endOfSelectedDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // Generate available time slots
    const availableSlots: { startTime: string; endTime: string }[] = [];

    availabilities.forEach((availability: Availability) => {
      const startTime = new Date(availability.startTime);
      const endTime = new Date(availability.endTime);

      // Set the date to the selected date while keeping the time
      startTime.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      endTime.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      // Generate slots based on service duration
      let currentSlotStart = startTime;
      while (currentSlotStart < endTime) {
        const currentSlotEnd = addMinutes(currentSlotStart, service.duration);

        // Check if this slot overlaps with any existing bookings
        const isSlotAvailable = !bookings.some((booking: Booking) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return (
            (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
            (currentSlotEnd > bookingStart && currentSlotEnd <= bookingEnd) ||
            (currentSlotStart <= bookingStart && currentSlotEnd >= bookingEnd)
          );
        });

        if (isSlotAvailable && currentSlotEnd <= endTime) {
          availableSlots.push({
            startTime: currentSlotStart.toISOString(),
            endTime: currentSlotEnd.toISOString(),
          });
        }

        // Move to next slot
        currentSlotStart = addMinutes(currentSlotStart, service.duration);
      }
    });

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 