const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchMediaDetails = async (mediaType, mediaId) => {
  try {
    if (!API_KEY) {
      throw new Error('API key is missing');
    }

    const response = await fetch(
      `${BASE_URL}/${mediaType}/${mediaId}?api_key=${API_KEY}&append_to_response=videos,credits,similar`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
};

export const fetchSeasonDetails = async (mediaId, seasonNumber) => {
  try {
    if (!API_KEY) {
      throw new Error('API key is missing');
    }

    const response = await fetch(
      `${BASE_URL}/tv/${mediaId}/season/${seasonNumber}?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching season details:', error);
    return null;
  }
};
