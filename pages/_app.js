import { ClerkProvider } from '@clerk/nextjs';
import "@/styles/globals.css";
import "@/styles/custom-scrollbar.css";
import ErrorBoundary from '@/components/ErrorBoundary';
import Chatbot from '@/components/Chatbot';
import Footer from '@/components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import dynamic from 'next/dynamic';
import { ReactQueryDevtools } from 'react-query/devtools';

// Dynamically import heavy components
const Header = dynamic(() => import('../components/Header'), {
  ssr: true,
  loading: () => <div className="h-20 bg-[#06202A]" />
});

function reportWebVitalsFn({ name, delta, id, value }) {
  // Log the metric
  console.log({
    name,
    delta,
    id,
    value
  });
  // You can send metrics to your analytics service here
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Add performance monitoring
    onCLS(reportWebVitalsFn);
    onFID(reportWebVitalsFn);
    onFCP(reportWebVitalsFn);
    onLCP(reportWebVitalsFn);
    onTTFB(reportWebVitalsFn);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <div className="min-h-screen flex flex-col bg-[#06202A]">
            <Header />
            <Component {...pageProps} />
            <Chatbot />
            <Footer />
          </div>
        </ClerkProvider>
      </QueryClientProvider>
      <ReactQueryDevtools />
    </ErrorBoundary>
  );
}
