'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Privacy() {
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
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 transition-colors duration-200`}>Privacy Policy</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Data Collection</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  We collect information that you provide directly to us, including your name, email address, 
                  and workout data. We also automatically collect certain information about your device and 
                  how you interact with our services.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>How We Use Your Data</h2>
                <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                  <li>To provide and maintain our services</li>
                  <li>To personalize your experience</li>
                  <li>To analyze and improve our services</li>
                  <li>To communicate with you</li>
                  <li>To protect our legal rights and comply with the law</li>
                </ul>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Data Security</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information. However, no method of transmission over the Internet or electronic 
                  storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Your Rights</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mb-4 transition-colors duration-200`}>
                  You have the right to:
                </p>
                <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Contact Us</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@swimmingworkouts.com" className="text-teal-500 hover:text-teal-400">
                    privacy@swimmingworkouts.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Changes to This Policy</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-200`}>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "last updated" date.
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