import Head from 'next/head';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Results from '../components/Results';
import requests from '../utils/requests';

export default function Home({ results = [] }) {
  return (
    <div className="bg-[#06202A] min-h-screen">
      <Head>
        <title>Hulu Clone - Stream TV and Movies</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Stream TV shows and movies online with Hulu Clone" />
      </Head>

      <Header />

      <div className="pt-24">
        <Nav />
      </div>

      <Results results={results} />
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const genre = context.query.genre;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey) {
      console.error('API key is missing');
      return {
        props: {
          results: [],
        },
      };
    }

    const url = requests[genre]?.url || requests.fetchTrending.url;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return {
      props: {
        results: data.results || [],
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        results: [],
      },
    };
  }
}
