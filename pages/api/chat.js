const TMDB_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Cache for storing recent searches and recommendations
const searchCache = new Map();
const userPreferences = new Map();

// Helper function to extract intent from user message
function extractIntent(message) {
  const message_lower = message.toLowerCase();
  
  if (message_lower.includes('search') || 
      message_lower.includes('find') || 
      message_lower.includes('looking for') ||
      message_lower.includes('show me')) {
    return 'search';
  }
  
  if (message_lower.includes('about') ||
      message_lower.includes('tell me more') ||
      message_lower.includes('what is')) {
    return 'details';
  }
  
  if (message_lower.includes('help') ||
      message_lower.includes('problem') ||
      message_lower.includes('issue') ||
      message_lower.includes('not working')) {
    return 'technical';
  }
  
  if (message_lower.includes('upcoming') ||
      message_lower.includes('new release') ||
      message_lower.includes('coming soon')) {
    return 'upcoming';
  }
  
  return 'default';
}

// Enhanced search function with multiple criteria
async function searchMovies(query, options = {}) {
  const cacheKey = JSON.stringify({ query, ...options });
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const endpoints = [];
    
    // Search movies and TV shows
    endpoints.push(fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    ));

    // Get trending content
    if (options.includeTrending) {
      endpoints.push(fetch(
        `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`
      ));
    }

    // Search by person (actor/director)
    if (options.searchPerson) {
      endpoints.push(fetch(
        `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      ));
    }

    const responses = await Promise.all(endpoints);
    const results = await Promise.all(responses.map(r => r.json()));
    
    // Combine and deduplicate results
    const combinedResults = {
      results: Array.from(new Set(results.flatMap(r => r.results || [])
        .map(item => {
          if (item.known_for) { // Handle person results
            return item.known_for;
          }
          return item;
        })
        .flat()
        .filter(item => item.title || item.name)
        .map(item => ({
          ...item,
          id: item.id.toString()
        }))))
    };

    // Cache results for 5 minutes
    searchCache.set(cacheKey, combinedResults);
    setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000);
    
    return combinedResults;
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
  }
}

// Get detailed information about a specific movie/show
async function getContentDetails(id, type = 'movie') {
  const cacheKey = `details-${type}-${id}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const [details, credits] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`).then(r => r.json()),
      fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json())
    ]);

    const result = {
      ...details,
      credits
    };

    searchCache.set(cacheKey, result);
    setTimeout(() => searchCache.delete(cacheKey), 30 * 60 * 1000); // Cache for 30 minutes
    
    return result;
  } catch (error) {
    console.error('Error fetching content details:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intent = extractIntent(message);
    let response = '';

    switch (intent) {
      case 'search': {
        const searchResults = await searchMovies(message);
        
        if (!searchResults.results?.length) {
          return res.json({ 
            reply: "I couldn't find any movies or shows matching your description. Could you try describing it differently?" 
          });
        }

        response = "Here are some recommendations based on your request:\n\n";
        const top5Results = searchResults.results.slice(0, 5);
        
        for (const item of top5Results) {
          const title = item.title || item.name;
          const mediaType = item.media_type === 'tv' ? '📺 TV Show' : '🎬 Movie';
          const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                      item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A';
          const rating = item.vote_average ? `${Math.round(item.vote_average * 10) / 10}/10` : 'N/A';
          
          response += `${mediaType}: ${title} (${year})\n`;
          response += `⭐ Rating: ${rating}\n`;
          if (item.overview) {
            response += `📝 ${item.overview}\n`;
          }
          response += '\n';
        }
        break;
      }

      case 'details': {
        const titleMatch = message.match(/about\s+["']?([^"']+)["']?/i) || 
                         message.match(/what\s+is\s+["']?([^"']+)["']?/i);
        
        if (!titleMatch) {
          return res.json({ 
            reply: "Which movie or show would you like to know more about?" 
          });
        }

        const searchResults = await searchMovies(titleMatch[1]);
        if (!searchResults.results?.[0]) {
          return res.json({ 
            reply: "I couldn't find that title. Could you try rephrasing or providing more information?" 
          });
        }

        const item = searchResults.results[0];
        const details = await getContentDetails(item.id, item.media_type);
        
        response = `Here's what I found about "${item.title || item.name}":\n\n`;
        response += `📅 Release Date: ${item.release_date || item.first_air_date || 'N/A'}\n`;
        response += `⭐ Rating: ${item.vote_average ? `${item.vote_average}/10` : 'N/A'}\n`;
        response += `⏱ Runtime: ${details.runtime || details.episode_run_time?.[0] || 'N/A'} minutes\n\n`;
        response += `📝 Overview:\n${item.overview || 'No overview available.'}\n\n`;
        
        if (details.credits?.cast?.length > 0) {
          response += `🎭 Main Cast:\n${details.credits.cast.slice(0, 5)
            .map(actor => `- ${actor.name} as ${actor.character}`)
            .join('\n')}\n\n`;
        }
        break;
      }

      case 'technical':
        response = "I can help you with technical issues. Please specify your problem:\n\n" +
                  "1. Playback issues\n" +
                  "2. Login problems\n" +
                  "3. Payment concerns\n" +
                  "4. Account settings\n\n" +
                  "What kind of help do you need?";
        break;

      case 'upcoming': {
        const upcoming = await fetch(
          `${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        ).then(r => r.json());

        response = "Here are some upcoming releases:\n\n";
        upcoming.results.slice(0, 5).forEach(movie => {
          response += `🎬 ${movie.title}\n`;
          response += `📅 Release Date: ${movie.release_date}\n`;
          if (movie.overview) {
            response += `📝 ${movie.overview}\n`;
          }
          response += '\n';
        });
        break;
      }

      default:
        response = "How can I help you today? I can:\n\n" +
                  "🔍 Search for movies and shows\n" +
                  "ℹ️ Provide detailed information about titles\n" +
                  "🆕 Tell you about upcoming releases\n" +
                  "🛠️ Help with technical issues\n\n" +
                  "What would you like to know?";
    }

    response += "\n\nCan I help you with anything else?";
    return res.json({ reply: response });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
