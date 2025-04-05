import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PROVIDER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const availability = await prisma.availability.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!availability) {
      return new NextResponse('Availability not found', { status: 404 });
    }

    if (availability.providerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.availability.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 