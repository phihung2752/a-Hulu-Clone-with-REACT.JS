import { useRouter } from 'next/router';
import { useClerk } from '@clerk/nextjs';

export default function UserDropdown({ user, onClose }) {
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    // Chuyển hướng về trang landing sau khi đăng xuất
    router.push('/landing');
    if (onClose) onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="px-4 py-2 text-sm text-gray-700 border-b">
        <p className="font-medium">{user?.fullName || user?.username}</p>
        <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
      
      <button
        onClick={() => router.push('/profile')}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Profile Settings
      </button>
      
      <button
        onClick={handleSignOut}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        Sign Out
      </button>
    </div>
  );
}
