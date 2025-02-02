'use client';

import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full ${
        isDark 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } transition-colors duration-200`}
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
    </button>
  );
} 