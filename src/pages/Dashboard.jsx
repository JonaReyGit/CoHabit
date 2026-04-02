import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"


function Dashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({  name: 'Guest',
                                            email: 'placeholder@gmail.com',
                                            picture: DEFAULT_AVATAR,
                                            city: 'City',
                                            state: 'State'
  })

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // no one is logged in
      if (!user){ 
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url, location_city, location_state')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile({
          name: data.full_name || 'No Name Provided',
          email: data.email,
          picture: data.avatar_url || DEFAULT_AVATAR,
          city: data.location_city || 'City',
          state: data.location_state || 'State',
        })
      }
    }

    getUserProfile()
  }, [])


return (
  <div className="min-h-screen flex flex-col items-center justify-center 
                bg-gray-50 dark:bg-gray-950">
    <header className="text-center mb-12">
      <h1 className=" text-4xl font-bold mb-5 
                    text-black dark:text-white">
        Welcome Back {profile.name}!
      </h1>
      <h2 className="text-gray-500 dark:text-gray-400">
        Lets find you some compatible roommates through smart matching
      </h2>
    </header>

    {/* holder for all the pages to navigate */}
    <div className="bg-white dark:bg-gray-900 
                    rounded-lg shadow p-8 text-center">
      
      {/* profile page */}
      <div className="flex gap-6 justify-center flex-wrap">
        <div
          className="border border-gray-200 dark:border-gray-700 
                      rounded-xl p-6 w-72 cursor-pointer 
                      hover:shadow-md dark:hover:shadow-gray-700 transition-shadow"
          onClick={() => navigate('/profile')}
        >
          <p className="font-bold text-center mb-3 
                      text-black dark:text-white">Account Settings</p>
          <div className="flex items-center gap-6">
            <img
              src={profile.picture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover 
                        bg-gray-200 dark:bg-gray-700"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
            />
            <div className="flex flex-col text-left text-sm">
              <span className="font-medium 
                              text-gray-700 dark:text-gray-200">{profile.name}</span>
              <span className="text-gray-400 dark:text-gray-500">{profile.city}, {profile.state}</span>
            </div>
          </div>
        </div>

        {/* messages page */}
        <div
          className="border border-gray-200 dark:border-gray-700 
                      rounded-xl p-6 w-72 cursor-pointer 
                      hover:shadow-md dark:hover:shadow-gray-700 transition-shadow 
                      text-left"
          onClick={() => navigate('/messaging')}
        >
          <p className="font-bold mb-3 text-center text-black dark:text-white">My Messages</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lets See Who Wants to Chat!</p>
        </div>

        {/* matching page */}
        <div
          className="border border-gray-200 dark:border-gray-700 
                      rounded-xl p-6 w-72 cursor-pointer 
                      hover:shadow-md dark:hover:shadow-gray-700 transition-shadow 
                      text-left"
          onClick={() => navigate('/matching')}
        >
          <p className="font-bold mb-3 text-center text-black dark:text-white">Start CoHabiting</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lets get you connected!</p>
        </div>
      </div>
    </div>
  </div>
)}

export default Dashboard
