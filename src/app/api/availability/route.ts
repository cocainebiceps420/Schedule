import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        providerId: session.user.id,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isRecurring } = body;

    // Parse the time strings into DateTime objects
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Create a base date (any date will do, we just need the time)
    const baseDate = new Date();
    baseDate.setHours(startHours, startMinutes, 0, 0);
    const startDateTime = baseDate;

    baseDate.setHours(endHours, endMinutes, 0, 0);
    const endDateTime = baseDate;

    const availability = await prisma.availability.create({
      data: {
        providerId: session.user.id,
        dayOfWeek,
        startTime: startDateTime,
        endTime: endDateTime,
        isRecurring,
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error creating availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 