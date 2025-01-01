import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Dynamically import components
const Header = dynamic(() => import('../components/Header'), {
  ssr: true,
  loading: () => <div className="h-20 bg-[#06202A]" />
});

const Nav = dynamic(() => import('../components/Nav'), {
  ssr: true,
  loading: () => <div className="h-16 bg-[#06202A]" />
});

const Results = dynamic(() => import('../components/Results'), {
  ssr: true,
  loading: () => <div className="min-h-[300px] bg-[#06202A]" />
});

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState('fetchTrending');
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  return (
    <div className="bg-[#06202A] min-h-screen">
      <Head>
        <title>Hulu - Vietnamese Movies</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      
      <Nav setSelectedGenre={setSelectedGenre} />

      <main className="relative pt-24">
        <Results genre={selectedGenre} />
      </main>
    </div>
  );
}
