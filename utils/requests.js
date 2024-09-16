const API_KEY = process.env.API_KEY;

export default {
	fetchTrending: {
		title: "Trending",
		url: `/trending/all/week?api_key=${API_KEY}&language=en-US`,
	},
	fetchTopRated: {
		title: "Top Rated",
		url: `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
	},
	fetchActionMovies: {
		title: "Action",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=28`,
	},
	fetchComedyMovies: {
		title: "Comedy",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=35`,
	},
	fetchHorrorMovies: {
		title: "Horror",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=27`,
	},
	fetchRomanceMovies: {
		title: "Romance",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
	},
	fetchMystery: {
		title: "Mystery",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=9648`,
	},
	fetchSciFi: {
		title: "Sci-Fi",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=878`,
	},
	fetchWestern: {
		title: "Western",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=37`,
	},
	fetchAnimation: {
		title: "Animation",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=16`,
	},
	fetchTV: {
		title: "TV Movie",
		url: `/discover/movie?api_key=${API_KEY}&with_genres=10770`,
	},
	fetchAdventure: {
        title: 'Adventure',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=12`
    },
    fetchFantasy: {
        title: 'Fantasy',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=14`
    },
    fetchDocumentary: {
        title: 'Documentary',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=99`
    },
    fetchCrime: {
        title: 'Crime',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=80`
    },
    fetchFamily: {
        title: 'Family',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=10751`
    },
    fetchWar: {
        title: 'War',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=10752`
    },
    fetchMusic: {
        title: 'Music',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=10402`
    },
    fetchHistory: {
        title: 'History',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=36`
    },
    fetchBiography: {
        title: 'Biography',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=10266`
    },
    fetchSports: {
        title: 'Sports',
        url: `/discover/movie?api_key=${API_KEY}&with_genres=9805`
    }
};
