import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }

  interface Session {
    user: User & {
      role: Role;
    };
  }
} 