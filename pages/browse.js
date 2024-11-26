import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Results from '../components/Results';
import SmartSearch from '../components/SmartSearch';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import requests from '../utils/requests';

export default function Browse() {
  const [results, setResults] = useState([]);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    // Load user history from localStorage
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setUserHistory(history);
  }, []);

  const handleSearchResults = (searchResults) => {
    setResults(searchResults);
  };

  return (
    <div className="bg-[#06202A] min-h-screen">
      <Head>
        <title>Hulu Clone - Browse</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Browse movies and TV shows on Hulu Clone" />
      </Head>

      <Header />
      
      <div className="pt-24">
        <Nav />
        <SmartSearch onResultsFound={handleSearchResults} />
      </div>

      {results.length > 0 ? (
        <Results results={results} />
      ) : (
        <PersonalizedRecommendations userHistory={userHistory} />
      )}
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
          error: 'Configuration error'
        }
      };
    }

    const request = await fetch(
      `https://api.themoviedb.org/3${
        requests[genre]?.url || requests.fetchTrending.url
      }&api_key=${apiKey}`
    ).then((res) => res.json());

    return {
      props: {
        results: request.results || [],
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        results: [],
        error: 'Failed to fetch data'
      }
    };
  }
}
