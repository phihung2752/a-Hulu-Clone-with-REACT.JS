import { useUser, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function UserProfile() {
    const { user } = useUser();
    const [watchHistory, setWatchHistory] = useState([]);

    useEffect(() => {
        // Load watch history from localStorage
        const loadWatchHistory = () => {
            const history = localStorage.getItem(`watchHistory_${user?.id}`);
            if (history) {
                setWatchHistory(JSON.parse(history));
            }
        };

        if (user) {
            loadWatchHistory();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#06202A] text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Image
                        src={user?.profileImageUrl}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full"
                    />
                    <div>
                        <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                        <p className="text-gray-400">{user?.primaryEmailAddress}</p>
                    </div>
                    <SignOutButton>
                        <button className="ml-auto bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">
                            Sign Out
                        </button>
                    </SignOutButton>
                </div>

                {/* Watch History */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Watch History</h2>
                    {watchHistory.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {watchHistory.map((item) => (
                                <Link href={`/watch/${item.id}`} key={item.id}>
                                    <div className="relative group cursor-pointer">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                            alt={item.title}
                                            width={300}
                                            height={450}
                                            className="rounded-lg transition group-hover:opacity-75"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-4">
                                            <h3 className="text-sm font-medium">{item.title}</h3>
                                            <div className="mt-1 h-1 bg-gray-600 rounded">
                                                <div
                                                    className="h-full bg-red-600 rounded"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No watch history yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
