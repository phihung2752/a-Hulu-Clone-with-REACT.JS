import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    HomeIcon,
    FilmIcon,
    TvIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { naturalLanguageSearch } from '../utils/ai-service';

const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Movies', href: '/movies', icon: FilmIcon },
    { name: 'TV Shows', href: '/tv', icon: TvIcon },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setIsSearching(true);
            setSearchResults([]); // Clear previous results
            console.log('Starting search with query:', searchQuery);

            const results = await naturalLanguageSearch(searchQuery);
            console.log('Search results:', results);

            if (results && results.length > 0) {
                setSearchResults(results);
                setIsSearchOpen(true);
            } else {
                setSearchResults([]);
                setIsSearchOpen(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setIsSearchOpen(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (result) => {
        const mediaType = result.media_type || (result.first_air_date ? 'tv' : 'movie');
        router.push(`/watch/${mediaType}-${result.id}`);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#06202A]' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/images/hulu-white.png"
                            alt="Hulu"
                            width={100}
                            height={50}
                            className="cursor-pointer object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <item.icon className="h-6 w-6 mr-1" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Search and Profile */}
                    <div className="flex items-center">
                        {/* Search Bar */}
                        <div className="relative mr-4">
                            <form onSubmit={handleSearch} className="flex items-center">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Try 'action movies with aliens'"
                                    className="bg-gray-800 text-white rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-white"
                                />
                                <button
                                    type="submit"
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                    disabled={isSearching}
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </button>
                            </form>

                            {/* Search Results Dropdown */}
                            {isSearchOpen && (
                                <div className="absolute mt-2 w-full bg-[#06202A] rounded-md shadow-lg py-1 z-50">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((result) => (
                                            <div
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                                            >
                                                <p className="text-white font-medium">
                                                    {result.title || result.name}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {result.media_type === 'movie' ? 'Movie' : 'TV Show'} •{' '}
                                                    {result.release_date || result.first_air_date
                                                        ? new Date(
                                                              result.release_date || result.first_air_date
                                                          ).getFullYear()
                                                        : 'Release date unknown'}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-400">
                                            {isSearching ? 'Searching...' : 'No results found'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-300 hover:text-white"
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    <item.icon className="h-6 w-6 mr-1" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
