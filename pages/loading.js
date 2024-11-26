import Image from 'next/image';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#06202A] flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <Image
                        src="/images/hulu-white.png"
                        alt="Hulu"
                        fill
                        className="object-contain animate-pulse"
                    />
                </div>
                <div className="space-y-4">
                    <div className="w-32 h-2 bg-gray-700 rounded animate-pulse mx-auto"></div>
                    <div className="w-24 h-2 bg-gray-700 rounded animate-pulse mx-auto"></div>
                </div>
            </div>
        </div>
    );
}
