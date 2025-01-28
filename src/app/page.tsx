import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { MdDashboard, MdAdd, MdPerson } from 'react-icons/md';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}

export default function Home() {
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
            <button className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-500 to-blue-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Track. Improve. Swim Smarter.</h1>
            <p className="text-xl mb-8">
              Easily log your swim workouts, analyze your progress, and stay motivated to reach your goals.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/write-workout" className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors">
                Write your workout
              </Link>
              <button className="bg-white text-teal-500 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition-colors">
                Start Tracking Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Distance"
              value="25,000m"
              description="this month"
              icon={<FaSwimmer className="h-6 w-6 text-teal-500" />}
            />
            <MetricCard
              title="Average Pace"
              value="1:45/100m"
              description="current average"
              icon={<FaChartLine className="h-6 w-6 text-teal-500" />}
            />
            <MetricCard
              title="Total Time"
              value="10 hours"
              description="this week"
              icon={<MdDashboard className="h-6 w-6 text-teal-500" />}
            />
            <MetricCard
              title="Calories Burned"
              value="3,000"
              description="this month"
              icon={<MdPerson className="h-6 w-6 text-teal-500" />}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-teal-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-teal-500 rounded-full p-3">
                <FaSwimmer className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Contact Us</h2>
            <p className="text-xl text-center mb-12 text-gray-600">Have questions? We&apos;d love to hear from you!</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors h-[160px] flex flex-col justify-center items-center">
                <p className="font-semibold text-lg text-gray-900 mb-3">Email</p>
                <a href="mailto:support@swimmingworkouts.com" 
                   className="text-teal-600 hover:text-teal-800 transition-colors text-center">
                  support@swimmingworkouts.com
                </a>
              </div>
              <div className="p-8 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors h-[160px] flex flex-col justify-center items-center">
                <p className="font-semibold text-lg text-gray-900 mb-3">Phone</p>
                <a href="tel:+1234567890" 
                   className="text-teal-600 hover:text-teal-800 transition-colors">
                  (123) 456-7890
                </a>
              </div>
              <div className="p-8 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors h-[160px] flex flex-col justify-center items-center">
                <p className="font-semibold text-lg text-gray-900 mb-3">Address</p>
                <div className="text-gray-700 text-center">
                  <p>123 Swimming Lane</p>
                  <p>Aqua City, AC 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 transition-colors">
        <MdAdd className="h-6 w-6" />
      </button>
    </div>
  );
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
