import { useRouter } from 'next/router';
import requests from '../utils/requests';

function Nav({ setSelectedGenre }) {
  const router = useRouter();

  const categories = [
    {
      title: "Mới cập nhật",
      value: "fetchTrending",
    },
    {
      title: "Phim lẻ",
      value: "fetchTopRated",
    },
    {
      title: "Phim bộ",
      value: "fetchActionMovies",
    },
    {
      title: "TV Shows",
      value: "fetchComedyMovies",
    },
    {
      title: "Hoạt hình",
      value: "fetchHorrorMovies",
    },
  ];

  return (
    <nav className="relative">
      <div className="flex px-10 sm:px-20 text-2xl whitespace-nowrap space-x-10 sm:space-x-20 overflow-x-scroll scrollbar-hide">
        {categories.map((category) => (
          <h2
            key={category.value}
            onClick={() => setSelectedGenre(category.value)}
            className="last:pr-24 cursor-pointer transition duration-100 transform hover:scale-125 hover:text-white active:text-red-500"
          >
            {category.title}
          </h2>
        ))}
      </div>
      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#06202A] h-10 w-1/12" />
    </nav>
  );
}

export default Nav;