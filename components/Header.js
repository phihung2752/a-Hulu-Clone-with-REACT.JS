'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import HeaderItem from './HeaderItem';
import { useUser } from '@clerk/nextjs';
import UserDropdown from './UserDropdown';
import {
  HomeIcon,
  BoltIcon,
  CheckBadgeIcon,
  CircleStackIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import NotificationBell from '../components/NotificationBell';
import SearchBar from './SearchBar';
import Notifications from './Notifications';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  return (
    <header className={`${isScrolled && 'bg-[#141414]'} fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all lg:px-10 lg:py-6`}>
      <div className="flex items-center space-x-2 md:space-x-10">
        <Image
          src="/hulu-white.png"
          alt="Hulu"
          width={100}
          height={50}
          className="cursor-pointer object-contain"
          onClick={() => router.push('/')}
        />

        <div className="hidden space-x-4 md:flex">
          <HeaderItem title="HOME" Icon={HomeIcon} onClick={() => router.push('/')} />
          <HeaderItem title="TRENDING" Icon={BoltIcon} onClick={() => router.push('/trending')} />
          <HeaderItem title="VERIFIED" Icon={CheckBadgeIcon} onClick={() => router.push('/verified')} />
          <HeaderItem title="COLLECTIONS" Icon={CircleStackIcon} onClick={() => router.push('/collections')} />
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm font-light">
        <SearchBar />
        <Notifications />
        <NotificationBell />
        {isLoaded && (
          <div ref={dropdownRef} className="relative">
            {user ? (
              <>
                <Image
                  onClick={() => setShowDropdown(!showDropdown)}
                  src={user.imageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="cursor-pointer rounded-full"
                />
                {showDropdown && <UserDropdown />}
              </>
            ) : (
              <HeaderItem title="ACCOUNT" Icon={UserIcon} onClick={() => router.push('/landing')} />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
