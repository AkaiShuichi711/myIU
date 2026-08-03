import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <p className="text-6xl font-bold text-slate-200 dark:text-slate-700">404</p>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Page not found</h1>
      <p className="text-sm text-slate-500">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
        Go home
      </Link>
    </div>
  )
}
