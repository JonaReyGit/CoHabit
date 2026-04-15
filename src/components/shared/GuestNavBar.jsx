import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import logo_img from "@/assets/images/Logo.svg"

const LOGO = logo_img

function GuestNavbar() {
  const navigate = useNavigate()

  // dark mode
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-200 dark:bg-gray-900 text-orange-700 dark:text-white shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-400 dark:border-gray-400">

      {/* Logo */}
      <h1
        className="text-xl font-bold cursor-pointer inline-flex items-center gap-2"
        onClick={() => navigate('/')}
      >
        <img
          src={LOGO}
          alt="CoHabit Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="hover:text-blue-900 dark:hover:text-blue-500">
          CoHabit
        </span>
      </h1>

      {/* Right side */}
      <div className="flex gap-4 items-center">

        {/* Login & Sign up button */}
        <button
          onClick={() => navigate('/login')}
          className="   bg-orange-700 dark:bg-gray-600
                        text-white px-3 py-.75 rounded-lg 
                        hover:text-blue-900 dark:hover:text-blue-500"
        >
          Login
        </button>

        <button
          onClick={() => navigate('/login')}
          className="   bg-orange-700 dark:bg-gray-600
                        text-white px-3 py-.75 rounded-lg 
                        hover:text-blue-900 dark:hover:text-blue-500"
        >
          Sign Up
        </button>



        {/* dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
            ${darkMode ? 'bg-blue-900' : 'bg-orange-200'}`}
        >
          <div
            className={`w-6 h-6 rounded-full shadow-md transform transition duration-300 flex items-center justify-center
              ${darkMode ? 'translate-x-6 bg-gray-900' : 'translate-x-0 bg-white'}`}
          >
            {darkMode ? (
              // moon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="white" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0 1 12 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.246 2.69-7.864 6.48-9.243.313-.114.664.12.62.457a7.5 7.5 0 0 0 9.786 9.786c.337-.044.571.307.457.62a9.751 9.751 0 0 1-1.84 3.132Z"
                />
              </svg>
            ) : (
              // sun
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="#1f2937" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            )}
          </div>
        </button>

      </div>
    </nav>
  )
}

export default GuestNavbar