import Image from "next/image";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";
import { useRouter } from "next/router";

const Thumbnail = forwardRef(({ result }, ref) => {
  const BASE_URL = "https://image.tmdb.org/t/p/w500/"; 
  const router = useRouter();

  const handleClick = () => {
    const mediaType = result.media_type || (result.first_air_date ? 'tv' : 'movie');
    const id = result.id;
    router.push(`/watch/${mediaType}-${id}`);
  };

  const getImageUrl = () => {
    if (result.backdrop_path) {
      return `${BASE_URL}${result.backdrop_path}`;
    }
    if (result.poster_path) {
      return `${BASE_URL}${result.poster_path}`;
    }
    return '/images/placeholder.jpg'; 
  };

  const getTitle = () => {
    return result.title || result.name || result.original_title || result.original_name || 'Untitled';
  };

  return (
    <div 
      ref={ref}
      onClick={handleClick}
      className="group p-2 cursor-pointer transition duration-200 ease-in transform sm:hover:scale-105 hover:z-50"
    >
      <div className="relative h-[300px] min-w-[200px] bg-gray-800 rounded-lg overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={getTitle()}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-2">
        {result.overview && (
          <p className="truncate max-w-md text-gray-300">{result.overview}</p>
        )}

        <h2 className="mt-1 text-2xl text-white transition-all duration-100 ease-in-out group-hover:font-bold">
          {getTitle()}
        </h2>

        <p className="flex items-center opacity-0 group-hover:opacity-100 text-gray-300">
          {result.media_type && (
            <span className="capitalize">{result.media_type} • </span>
          )}
          {(result.release_date || result.first_air_date) && (
            <span>{new Date(result.release_date || result.first_air_date).getFullYear()} • </span>
          )}
          {result.vote_count > 0 && (
            <>
              <HandThumbUpIcon className="h-5 mx-2" /> 
              {result.vote_count}
            </>
          )}
        </p>
      </div>
    </div>
  );
});

Thumbnail.displayName = "Thumbnail";

export default Thumbnail;
