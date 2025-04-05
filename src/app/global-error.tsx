'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Something went wrong!</h1>
        <p className="mt-2 text-lg text-gray-600">We're working on fixing this issue.</p>
        <div className="mt-6">
          <button
            onClick={() => reset()}
            className="text-blue-600 hover:text-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
} 