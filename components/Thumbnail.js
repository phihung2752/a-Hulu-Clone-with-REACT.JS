import { ThumbUpIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { forwardRef } from 'react';

const Thumbnail = forwardRef(({ result }, ref) => {
  return (
    <div
      ref={ref}
      className="p-2 group cursor-pointer transition duration-200 ease-in transform sm:hover:scale-105 hover:z-50"
    >
      <Image
        layout="responsive"
        src={result.poster || result.backdrop}
        alt={result.title}
        height={1080}
        width={1920}
      />

      <div className="p-2">
        <p className="truncate max-w-md">{result.description}</p>

        <h2 className="mt-1 text-2xl text-white transition-all duration-100 ease-in-out group-hover:font-bold">
          {result.title}
        </h2>

        <p className="flex items-center opacity-0 group-hover:opacity-100">
          {result.type} • {result.year} •{' '}
          <ThumbUpIcon className="h-5 mx-2" /> {result.rating}
        </p>
      </div>
    </div>
  );
});

Thumbnail.displayName = 'Thumbnail';

export default Thumbnail;
