'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Contact() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header/Navigation */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className={`ml-2 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>SwimTracker</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaHome className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/history" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              Calendar
            </Link>
            <Link href="/dashboard" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <ThemeToggle />
            <Link 
              href="/logout" 
              className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
            >
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8 transition-colors duration-200`}>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 transition-colors duration-200`}>Contact Us</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 transition-colors duration-200`}>Send us a message</h2>
                <form className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
                      Name
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } transition-colors duration-200`}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } transition-colors duration-200`}
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
                      Message
                    </label>
                    <textarea
                      rows={6}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } transition-colors duration-200`}
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 transition-colors duration-200`}>Contact Information</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <FaEnvelope className="h-6 w-6 text-teal-500 mt-1" />
                    <div className="ml-4">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Email</h3>
                      <a href="mailto:support@swimmingworkouts.com" className="text-teal-500 hover:text-teal-400">
                        support@swimmingworkouts.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="h-6 w-6 text-teal-500 mt-1" />
                    <div className="ml-4">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Phone</h3>
                      <a href="tel:+1234567890" className="text-teal-500 hover:text-teal-400">
                        (123) 456-7890
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="h-6 w-6 text-teal-500 mt-1" />
                    <div className="ml-4">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Address</h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                        123 Swimming Lane<br />
                        Aqua City, AC 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
              <Link href="/about" className="text-gray-400 hover:text-teal-400">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-teal-400">Contact</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-teal-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 