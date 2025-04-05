import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseISO, addMinutes, format } from 'date-fns';
import { sendEmail, createBookingConfirmationEmail, createProviderNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { serviceId, providerId, date, time, notes } = body;

    // Get the service to get its duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }

    // Parse the date and time
    const startTime = parseISO(time);
    const endTime = addMinutes(startTime, service.duration);

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customerId: session.user.id,
        providerId,
        serviceId,
        startTime,
        endTime,
        notes,
        status: 'PENDING',
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notifications
    try {
      // Send confirmation email to customer
      await sendEmail({
        to: booking.customer.email,
        subject: 'Booking Confirmation',
        html: createBookingConfirmationEmail(
          booking.customer.name || 'Customer',
          booking.provider.name || 'Provider',
          booking.service.name,
          format(startTime, 'MMMM d, yyyy'),
          format(startTime, 'h:mm a'),
          booking.service.duration,
          booking.service.price
        ),
      });

      // Send notification email to provider
      await sendEmail({
        to: booking.provider.email,
        subject: 'New Booking Notification',
        html: createProviderNotificationEmail(
          booking.provider.name || 'Provider',
          booking.customer.name || 'Customer',
          booking.service.name,
          format(startTime, 'MMMM d, yyyy'),
          format(startTime, 'h:mm a'),
          booking.service.duration,
          booking.service.price
        ),
      });
    } catch (error) {
      console.error('Error sending email notifications:', error);
      // Don't fail the booking creation if email sending fails
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customerId: session.user.id },
          { providerId: session.user.id },
        ],
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 