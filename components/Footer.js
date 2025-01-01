import React from 'react';
import Link from 'next/link';
import StoreBadges from './StoreBadges';
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#06202A] text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">BROWSE</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Trending</Link></li>
              <li><Link href="/" className="hover:text-white">Movies</Link></li>
              <li><Link href="/" className="hover:text-white">TV Shows</Link></li>
              <li><Link href="/" className="hover:text-white">Originals</Link></li>
              <li><Link href="/" className="hover:text-white">Networks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Account & Billing</Link></li>
              <li><Link href="/" className="hover:text-white">Plans & Pricing</Link></li>
              <li><Link href="/" className="hover:text-white">Supported Devices</Link></li>
              <li><Link href="/" className="hover:text-white">Accessibility</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">ABOUT US</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Press</Link></li>
              <li><Link href="/" className="hover:text-white">Jobs</Link></li>
              <li><Link href="/" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">DOWNLOAD APPS</h3>
            <StoreBadges />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebookF className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaYoutube className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
            
            <div className="text-sm text-gray-400">
              {new Date().getFullYear()} Hulu Clone. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
