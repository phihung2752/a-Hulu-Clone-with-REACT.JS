import requests from "@/utils/requests";
import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";

function Nav() {
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <nav className="relative">
      <div 
        ref={scrollContainerRef}
        className="flex scrollbar-hide px-10 sm:px-20 whitespace-nowrap space-x-10 sm:space-x-20 overflow-x-scroll text-2xl"
        style={{ scrollBehavior: 'smooth' }}
      >
        {Object.entries(requests).map(([key, { title, url }]) => (
          <h2
            className="last:pr-24 cursor-pointer transition duration-100 transform hover:scale-125 hover:text-white active:text-red-400 flex-shrink-0"
            key={key}
            onClick={() => router.push(`/?genre=${key}`)}
          >
            {title}
          </h2>
        ))}
      </div>
      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#06202A] h-10 w-1/12" />
    </nav>
  );
}

export default Nav;