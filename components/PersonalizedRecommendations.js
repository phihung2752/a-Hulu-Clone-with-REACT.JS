import { useState, useEffect } from 'react';
import { getPersonalizedRecommendations } from '../utils/ai-service';
import Thumbnail from './Thumbnail';

export default function PersonalizedRecommendations({ userHistory }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      if (!userHistory?.length) return;
      
      try {
        const recs = await getPersonalizedRecommendations(userHistory);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [userHistory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="px-5 my-10 sm:grid md:grid-cols-2 xl:grid-cols-3 3xl:flex flex-wrap justify-center">
      <h2 className="w-full text-2xl font-bold mb-4">Recommended for You</h2>
      {recommendations.map((result) => (
        <Thumbnail key={result.id} result={result} />
      ))}
    </div>
  );
}
