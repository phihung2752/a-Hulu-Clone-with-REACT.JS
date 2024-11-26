import { ClerkProvider } from '@clerk/nextjs';
import "@/styles/globals.css";
import "@/styles/custom-scrollbar.css";
import ErrorBoundary from '@/components/ErrorBoundary';
import Chatbot from '@/components/Chatbot';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <Component {...pageProps} />
        <Chatbot />
      </ClerkProvider>
    </ErrorBoundary>
  );
}
