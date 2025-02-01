'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
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

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">About SwimTracker</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  SwimTracker is dedicated to helping swimmers of all levels achieve their goals through intelligent workout tracking, 
                  personalized training plans, and advanced analytics. We believe in making swimming training more accessible, 
                  data-driven, and enjoyable for everyone.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Intelligent workout tracking with AI-powered analysis</li>
                  <li>Personalized training plans based on your goals</li>
                  <li>Advanced analytics and progress tracking</li>
                  <li>Technique analysis and improvement suggestions</li>
                  <li>Community support and sharing features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Team</h2>
                <p className="text-gray-600 leading-relaxed">
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© 2024 SwimTracker, Inc. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:text-teal-400">About</Link>
              <Link href="/contact" className="hover:text-teal-400">Contact</Link>
              <Link href="/privacy" className="hover:text-teal-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 