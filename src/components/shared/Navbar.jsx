import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/9/98/Avatar_for_duckmather.png"
const LOGO = "https://upload.wikimedia.org/wikipedia/commons/d/d9/Noun_Project_house_icon_475319_cc_%28Wikiarabia_2022%29.svg"

function Navbar({ onSignOut }) {
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)


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
  


  // get user profile from Supabase
  const [profile, setProfile] = useState({  name: 'Guest',
                                            email: 'placeholder@gmail.com',
                                            picture: DEFAULT_AVATAR,
  })

  const getUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile({
          name: data.full_name || 'No Name Provided',
          email: data.email,
          picture: data.avatar_url || DEFAULT_AVATAR,
        })
      }
    } 
    
    // when signed out
    if (!user) {
      setProfile({  name: 'Guest', 
                    email: 'placeholder@gmail.com', 
                    picture: DEFAULT_AVATAR })
      return
    }
  }

  useEffect(() => {
    getUserProfile()

    // run again on sign out
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // fancy. close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // signing out of the account
  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    onSignOut?.()
    navigate('/login')
  }

  // so i don't have to write the same code again and again and again
  const navTo = (path) => {
    navigate(path)
    setDropdownOpen(false)
  }

  return (
    <nav className=" sticky top-0 z-50
                      bg-gray-200 dark:bg-gray-900
                      text-orange-700 dark:text-white 
                      shadow-md px-6 py-4 flex justify-between items-center
                      border-b border-gray-400 dar:border-gray-400">
      <h1
        className="text-xl font-bold cursor-pointer inline-flex items-center gap-2"
        onClick={() => navigate('/homepage')}
      >
        <img 
          src={LOGO}
          alt="CoHabit Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="hover:text-blue-900 dark:hover:text-blue-500 ">CoHabit</span>
      </h1>

      {/* Template for regular buttons to be clicked */}
      <div className="flex gap-4 items-center relative">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-blue-900 dark:hover:text-blue-500"
        >
          Dashboard
        </button>


        {/* the hamburger icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="hover:text-blue-900 dark:hover:text-blue-500 flex items-center gap-1"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

        {/* when the dropdown is clicked and open */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 
                          bg-white dark:bg-gray-800 
                            border dark:border-gray-700 
                            rounded-lg shadow-lg z-50">
              {/* Profile header */}
              <div className="p-3 border-b flex items-center gap-3">
                <img
                  src={profile.picture}
                  alt="Profile avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">{profile.name}</span>
                  <span className="text-gray-600 text-sm italic truncate">{profile.email}</span>
                </div>
              </div>

              {/* each possible link inside the dropdown */}
              <ul className="text-sm">
                <li>
                  <button
                    onClick={() => navTo('/dashboard')}
                    className=" w-full text-left px-4 py-2 
                              hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Dashboard
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/matching')}
                    className=" w-full text-left px-4 py-2 
                              hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Matching
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/messaging')}
                    className=" w-full text-left px-4 py-2 
                              hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Messaging
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/profile')}
                    className=" w-full text-left px-4 py-2 
                              hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Profile
                  </button>
                </li>

                <li>
                  <hr className="border-t" />
                  <button
                    onClick={handleSignOut}
                    className=" w-full py-2 
                              hover:bg-red-200 dark:hover:bg-slate-500
                              text-red-600 dark:text-white font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* dark mode slider */}
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
              // moon icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="white" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0 1 12 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.246 2.69-7.864 6.48-9.243.313-.114.664.12.62.457a7.5 7.5 0 0 0 9.786 9.786c.337-.044.571.307.457.62a9.751 9.751 0 0 1-1.84 3.132Z"
                />
              </svg>
            ) : (
              // sun icon
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

export default Navbar
