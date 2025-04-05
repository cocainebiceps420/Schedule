import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/services - Get all services
export async function GET(request: Request) {
  try {
    // Anyone can see all services, authentication is optional
    const services = await prisma.service.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/services - Create a new service (providers only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, description, duration, price } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        providerId: session.user.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 