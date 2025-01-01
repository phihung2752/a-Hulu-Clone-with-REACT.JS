import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-[#06202A] text-white flex items-center justify-center">
      <Head>
        <title>404 - Page Not Found | Hulu Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md p-8 bg-gray-800 rounded-lg text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Page Not Found</p>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <span className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200">
            Go Back Home
          </span>
        </Link>
      </div>
    </div>
  );
}
