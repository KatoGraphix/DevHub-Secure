export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">404</h1>
        <h2 className="text-2xl mb-4">Page Not Found</h2>
        <p className="text-zinc-400 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a
          href="/"
          className="px-6 py-3 bg-cyan-500 text-white rounded hover:bg-cyan-400 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}