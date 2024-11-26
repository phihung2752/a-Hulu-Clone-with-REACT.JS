import React from 'react';
import Thumbnail from './Thumbnail';

function Results({ results = [], error = null }) {
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-white">
        <p className="text-lg">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-white">
        <p className="text-lg">No results found.</p>
      </div>
    );
  }

  return (
    <div className="px-5 my-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {results.map((result) => (
        result && <Thumbnail key={result.id} result={result} />
      ))}
    </div>
  );
}

export default Results;
