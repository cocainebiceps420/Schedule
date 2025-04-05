import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PROVIDER') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const service = await prisma.service.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!service || service.providerId !== session.user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    await prisma.service.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting service:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }

    if (service.providerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, description, duration, price } = body;

    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }

    if (service.providerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 