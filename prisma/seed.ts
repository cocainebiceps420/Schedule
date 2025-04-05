import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a provider
  const providerPassword = await hash('provider123', 10);
  const provider = await prisma.user.create({
    data: {
      name: 'Jane Provider',
      email: 'provider@example.com',
      password: providerPassword,
      role: 'PROVIDER',
      phone: '555-123-4567',
      address: '123 Provider St, Business City',
    },
  });

  // Create a customer
  const customerPassword = await hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '555-987-6543',
      address: '456 Customer Ave, Hometown',
    },
  });

  // Create services
  const haircut = await prisma.service.create({
    data: {
      name: 'Haircut',
      description: 'Professional haircut service',
      duration: 60,
      price: 45.0,
      providerId: provider.id,
    },
  });

  const manicure = await prisma.service.create({
    data: {
      name: 'Manicure',
      description: 'Professional nail care for your hands',
      duration: 45,
      price: 35.0,
      providerId: provider.id,
    },
  });

  // Create availability
  await prisma.availability.create({
    data: {
      providerId: provider.id,
      dayOfWeek: 1, // Monday
      startTime: new Date(2023, 0, 1, 9, 0), // 9:00 AM
      endTime: new Date(2023, 0, 1, 17, 0), // 5:00 PM
      isRecurring: true,
    },
  });

  await prisma.availability.create({
    data: {
      providerId: provider.id,
      dayOfWeek: 3, // Wednesday
      startTime: new Date(2023, 0, 1, 9, 0), // 9:00 AM
      endTime: new Date(2023, 0, 1, 17, 0), // 5:00 PM
      isRecurring: true,
    },
  });

  // Create a booking
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 3); // 3 days from now
  startTime.setHours(10, 0, 0, 0); // 10:00 AM

  const endTime = new Date(startTime);
  endTime.setMinutes(startTime.getMinutes() + haircut.duration);

  const booking = await prisma.booking.create({
    data: {
      startTime,
      endTime,
      status: 'CONFIRMED',
      notes: 'First time customer',
      customerId: customer.id,
      providerId: provider.id,
      serviceId: haircut.id,
    },
  });

  // Add a review
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellent service!',
      bookingId: booking.id,
      userId: customer.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 