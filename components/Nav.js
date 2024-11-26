import requests from "@/utils/requests";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

function Nav() {
    const router = useRouter();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [activeGenre, setActiveGenre] = useState(router.query.genre || 'fetchTrending');

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 300;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleGenreClick = (key) => {
        setActiveGenre(key);
        router.push(`/?genre=${key}`);
    };

    return (
        <nav className="relative mt-16">
            {/* Left Arrow */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-[#06202A] px-2 flex items-center justify-center hover:from-[#06202A]/80 transition-all"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Navigation Items */}
            <div
                ref={scrollContainerRef}
                className="flex px-10 sm:px-20 space-x-10 sm:space-x-20 overflow-x-scroll scrollbar-hide text-2xl whitespace-nowrap py-4"
                style={{ scrollBehavior: 'smooth' }}
            >
                {Object.entries(requests).map(([key, { title }]) => (
                    <h2
                        key={key}
                        onClick={() => handleGenreClick(key)}
                        className={`cursor-pointer transition duration-100 transform hover:scale-125 hover:text-white active:text-red-500
                            ${activeGenre === key ? 'text-white scale-125' : 'text-gray-400'}`}
                    >
                        {title}
                    </h2>
                ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-[#06202A] px-2 flex items-center justify-center hover:from-[#06202A]/80 transition-all"
                >
                    <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
            )}
        </nav>
    );
}

export default Nav;