import UserProfile from '@/components/UserProfile';
import Header from '@/components/Header';

export default function Profile() {
    return (
        <div className="min-h-screen bg-[#06202A]">
            <Header />
            <UserProfile />
        </div>
    );
}
