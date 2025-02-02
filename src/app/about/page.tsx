'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function About() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header/Navigation */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:text-teal-500 transition-colors cursor-pointer">
              <FaSwimmer className="h-8 w-8 text-teal-500" />
              <span className={`ml-2 text-xl font-semibold ${isDark ? 'text-white hover:text-teal-400' : 'text-gray-900 hover:text-teal-600'} transition-colors duration-200`}>SwimTracker</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaHome className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/history" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              Calendar
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <ThemeToggle />
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

      <main className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-8 transition-colors duration-200`}>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 transition-colors duration-200`}>About SwimTracker</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Our Mission</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  SwimTracker is dedicated to helping swimmers of all levels achieve their goals through intelligent workout tracking, 
                  personalized training plans, and advanced analytics. We believe in making swimming training more accessible, 
                  data-driven, and enjoyable for everyone.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Features</h2>
                <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                  <li>Intelligent workout tracking with AI-powered analysis</li>
                  <li>Personalized training plans based on your goals</li>
                  <li>Advanced analytics and progress tracking</li>
                  <li>Technique analysis and improvement suggestions</li>
                  <li>Community support and sharing features</li>
                </ul>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Our Team</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  Our team consists of passionate swimmers, coaches, and technology experts who understand the unique needs 
                  of swimmers. We're committed to continuously improving SwimTracker based on user feedback and the latest 
                  developments in swimming training methodology.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} text-white py-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© 2024 SwimTracker, Inc. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className={`${isDark ? 'text-gray-400 hover:text-teal-400' : 'text-gray-700 hover:text-teal-400'}`}>About</Link>
              <Link href="/contact" className={`${isDark ? 'text-gray-400 hover:text-teal-400' : 'text-gray-700 hover:text-teal-400'}`}>Contact</Link>
              <Link href="/privacy" className={`${isDark ? 'text-gray-400 hover:text-teal-400' : 'text-gray-700 hover:text-teal-400'}`}>Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 