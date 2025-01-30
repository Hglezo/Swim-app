'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:text-teal-500 transition-colors">
          <FaSwimmer className="h-8 w-8 text-teal-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className={`${isActive('/') ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
          >
            <FaHome className="h-5 w-5 mr-2" />
            Home
          </Link>
          <Link 
            href="/history" 
            className={`${isActive('/history') ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
          >
            <FaCalendarAlt className="h-5 w-5 mr-2" />
            Calendar
          </Link>
          <Link 
            href="/dashboard" 
            className={`${isActive('/dashboard') ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
          >
            <MdDashboard className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <Link 
            href="/insights" 
            className={`${isActive('/insights') ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
          >
            <FaChartLine className="h-5 w-5 mr-2" />
            Insights
          </Link>
          <Link 
            href="/profile" 
            className={`${isActive('/profile') ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
          >
            <MdPerson className="h-5 w-5 mr-2" />
            Profile
          </Link>
          <Link 
            href="/logout" 
            className="text-gray-700 hover:text-teal-500 transition-colors flex items-center"
          >
            <FaSignOutAlt className="h-5 w-5 mr-2" />
            Log Out
          </Link>
        </div>
      </nav>
    </header>
  );
} 