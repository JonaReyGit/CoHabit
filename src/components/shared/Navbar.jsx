import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"

function Navbar({ onSignOut }) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [profile, setProfile] = useState({  name: 'Guest',
                                            email: 'placeholder@gmail.com',
                                            picture: DEFAULT_AVATAR,
  })

  // Fetch user profile from Supabase
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
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        CoHabit
      </h1>

      {/* Template for regular buttons to be clicked */}
      <div className="flex gap-4 items-center relative">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-blue-600"
        >
          Dashboard
        </button>

        {/* the hamburger icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="hover:text-blue-600 flex items-center gap-1"
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
            <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg z-50">
              {/* Profile header */}
              <div className="p-3 border-b flex items-center gap-3">
                <img
                  src={profile.picture}
                  alt="Profile avatar"
                  className="w-12 h-12 rounded-full object-cover"
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
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/matching')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Matching
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/messaging')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Messaging
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navTo('/profile')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                </li>

                <li>
                  <hr className="border-t" />
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 hover:bg-red-100 text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
