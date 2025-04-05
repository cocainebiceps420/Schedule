'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Page not found</p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
} 