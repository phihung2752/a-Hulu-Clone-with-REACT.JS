const GOOGLE_AI_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Debug logging function
const debugLog = (message, data) => {
  console.log(`[AI Service Debug] ${message}:`, data);
};

// Phân tích lịch sử xem để đề xuất phim
export const getPersonalizedRecommendations = async (userHistory) => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GOOGLE_AI_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Based on user's watch history: ${JSON.stringify(userHistory)}, 
                   suggest 5 movies or TV shows with their TMDB IDs that they might enjoy. 
                   Format the response as a JSON array of objects with title and tmdbId.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from AI');
    }

    const recommendations = JSON.parse(data.candidates[0].content.parts[0].text);
    
    // Fetch detailed info for each recommendation from TMDB
    const detailedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${rec.tmdbId}?api_key=${TMDB_API_KEY}`
        );
        if (!tmdbResponse.ok) {
          return null;
        }
        return await tmdbResponse.json();
      })
    );

    return detailedRecommendations.filter(Boolean);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

// Tìm kiếm bằng ngôn ngữ tự nhiên
export const naturalLanguageSearch = async (query) => {
  try {
    debugLog('Starting search with query', query);

    // For now, let's use direct TMDB search since we're having AI API issues
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    debugLog('TMDB API URL (without key)', tmdbUrl.replace(TMDB_API_KEY, 'HIDDEN'));
    
    const searchResponse = await fetch(tmdbUrl);

    if (!searchResponse.ok) {
      throw new Error(`TMDB API error! status: ${searchResponse.status}`);
    }

    const searchResults = await searchResponse.json();
    debugLog('TMDB Search Results', {
      total_results: searchResults.total_results,
      result_count: searchResults.results?.length
    });

    return searchResults.results || [];
  } catch (error) {
    console.error('Error in search:', error);
    debugLog('Search error', error.message);
    return [];
  }
};

// Phân tích phản hồi người dùng
export const analyzeFeedback = async (feedback) => {
  try {
    if (!GOOGLE_AI_KEY) {
      console.error('Missing Google AI key');
      return null;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GOOGLE_AI_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this user feedback and extract sentiment, key points, and suggestions: "${feedback}". 
                   Return the analysis as a JSON object with sentiment (positive/negative/neutral), 
                   keyPoints (array), and suggestions (array).`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from AI');
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    return null;
  }
};
