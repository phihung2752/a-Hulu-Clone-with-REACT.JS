import React, { memo, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { useMovies } from '../hooks/useMovies';
import FlipMove from 'react-flip-move';

// Dynamically import Thumbnail with no SSR for better initial load
const Thumbnail = dynamic(() => import('./Thumbnail'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-[200px] bg-gray-700 rounded-lg"></div>
      <div className="mt-2 h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  ),
});

const ErrorMessage = memo(({ message }) => (
  <div className="flex flex-col justify-center items-center min-h-[300px] text-white">
    <p className="text-lg text-center mb-4">{message}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="bg-[#06202A] hover:bg-[#0F3D63] text-white font-bold py-2 px-4 rounded transition duration-200"
    >
      Try Again
    </button>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

const ResultItem = memo(({ result }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
      {inView && <Thumbnail result={result} />}
    </div>
  );
});

ResultItem.displayName = 'ResultItem';

const Results = memo(({ genre }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useMovies(genre);
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  const movies = data?.pages.flatMap(page => page.results) || [];

  if (movies.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-white">No movies found</div>
      </div>
    );
  }

  return (
    <div className="px-5 my-10">
      <FlipMove className="sm:grid md:grid-cols-2 xl:grid-cols-3 3xl:flex flex-wrap justify-center">
        {movies.map((result) => (
          <Thumbnail key={result.id} result={result} />
        ))}
      </FlipMove>
      {hasNextPage && (
        <div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
});

Results.displayName = 'Results';

export default Results;
