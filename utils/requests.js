const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const requests = {
  fetchTrending: {
    title: "Trending",
    url: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`,
  },
  fetchTopRated: {
    title: "Top Rated",
    url: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
  },
  fetchActionMovies: {
    title: "Action",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  },
  fetchComedyMovies: {
    title: "Comedy",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  },
  fetchHorrorMovies: {
    title: "Horror",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`,
  },
  fetchRomanceMovies: {
    title: "Romance",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749`,
  },
  fetchMystery: {
    title: "Mystery",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=9648`,
  },
  fetchSciFi: {
    title: "Sci-Fi",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  },
  fetchWestern: {
    title: "Western",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=37`,
  },
  fetchAnimation: {
    title: "Animation",
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16`,
  },
  fetchTVShows: {
    title: "TV Shows",
    url: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_type=2`,
  },
  fetchAdventure: {
    title: 'Adventure',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=12`
  },
  fetchFantasy: {
    title: 'Fantasy',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=14`
  },
  fetchDocumentary: {
    title: 'Documentary',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99`
  },
  fetchCrime: {
    title: 'Crime',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=80`
  },
  fetchFamily: {
    title: 'Family',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10751`
  },
  fetchWar: {
    title: 'War',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10752`
  },
  fetchMusic: {
    title: 'Music',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10402`
  },
  fetchHistory: {
    title: 'History',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=36`
  },
  fetchBiography: {
    title: 'Biography',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10266`
  },
  fetchSports: {
    title: 'Sports',
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=9805`
  }
};

export default requests;
