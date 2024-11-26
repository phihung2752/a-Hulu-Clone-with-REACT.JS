import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Loading from '../pages/loading';

const CLOCK_SKEW_SECONDS = 300; // 5 minutes

const publicPages = ['/landing', '/', '/movies', '/tv', '/search'];

export default function AuthProvider({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Handle initial loading
    useEffect(() => {
        setMounted(true);
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    // Handle route changes
    useEffect(() => {
        if (!mounted) return;

        const handleStart = () => setIsLoading(true);
        const handleComplete = () => setIsLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router, mounted]);

    // Custom navigation handler
    const handleNavigate = async (to) => {
        try {
            setIsLoading(true);
            await router.push(to);
        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return <Loading />;
    }

    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: '#ff0000',
                    colorTextOnPrimaryBackground: '#ffffff',
                },
                elements: {
                    formButtonPrimary: 'bg-red-600 hover:bg-red-700',
                    footerActionLink: 'text-red-600 hover:text-red-700',
                    card: 'bg-[#06202A]',
                }
            }}
            navigate={handleNavigate}
            options={{
                allowedRedirectOrigins: [process.env.NEXT_PUBLIC_CLERK_FRONTEND_API],
                signInUrl: '/landing',
                signUpUrl: '/landing',
                afterSignInUrl: '/',
                afterSignUpUrl: '/',
                clockSkewInSeconds: CLOCK_SKEW_SECONDS,
                tokenCache: 'session',
            }}
        >
            {isLoading ? <Loading /> : children}
        </ClerkProvider>
    );
}
