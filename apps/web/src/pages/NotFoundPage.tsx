import { Link } from 'react-router';

/**
 * Catch-all route so an unknown URL never renders a blank page
 * (FRONTEND.md section 88).
 */
export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-slate-600">This page does not exist or has been moved.</p>
      <Link to="/" className="font-medium underline">
        Go to the home page
      </Link>
    </main>
  );
}
