import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface BookingsByStatus {
  PENDING: number;
  CONFIRMED: number;
  CANCELLED: number;
  COMPLETED: number;
}

interface Booking {
  id: string;
  startTime: Date;
  status: BookingStatus;
  service: {
    price: number;
  };
  reviews: Review[];
}

interface Review {
  id: string;
  rating: number;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days')) || 30;

    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get all bookings within the date range
    const bookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        service: true,
        reviews: true,
      },
    }) as Booking[];

    // Calculate total bookings and revenue
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum: number, booking: Booking) => sum + booking.service.price,
      0
    );

    // Calculate average rating
    const reviews = bookings.flatMap((booking: Booking) => booking.reviews);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Calculate bookings by status
    const bookingsByStatus = bookings.reduce(
      (acc: BookingsByStatus, booking: Booking) => {
        const status = booking.status as keyof BookingsByStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        PENDING: 0,
        CONFIRMED: 0,
        CANCELLED: 0,
        COMPLETED: 0,
      }
    );

    // Calculate bookings and revenue by day
    const bookingsByDay = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayBookings = bookings.filter(
        (booking: Booking) =>
          booking.startTime >= startOfDay(date) &&
          booking.startTime <= endOfDay(date)
      );
      return {
        date: date.toISOString(),
        count: dayBookings.length,
        revenue: dayBookings.reduce(
          (sum: number, booking: Booking) => sum + booking.service.price,
          0
        ),
      };
    }).reverse();

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      averageRating,
      bookingsByStatus,
      bookingsByDay,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 