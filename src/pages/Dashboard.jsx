import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import d_a_img from "@/assets/images/default-avatar.png";

// const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"
const DEFAULT_AVATAR = d_a_img


function Dashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({  name: 'Guest',
                                            email: 'placeholder@gmail.com',
                                            picture: DEFAULT_AVATAR,
                                            city: 'City',
                                            state: 'State'
  })

  // handle the flashing data
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

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

      setLoading(false)
    }

    getUserProfile()
  }, [])

  /*

Notification modal for new messages

  */

  // get unread count and subscribe to new messages
  useEffect(() => {
    let channel;
    const fetchUnreadAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      // gets initial count

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);

      // picks up subscribe changes
      channel = supabase.channel(`dashboard-messages-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.is_read === false) {
            setUnreadCount(prev => prev + 1);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.is_read === true && payload.old.is_read === false) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        })
        .subscribe();
    };

    fetchUnreadAndSubscribe();

    return () => { if (channel) supabase.removeChannel(channel); }
  }, [])

// so the "Guest" and default values don't flash before the actual user data loads
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  )
}

return (
  <div className="min-h-screen flex flex-col items-center justify-center 
                bg-gray-50 dark:bg-gray-950">
    <header className="text-center mb-12">
      <h1 className=" text-4xl font-bold mb-5 
                    text-gray-900 dark:text-white">
        Welcome Back <span style={{ color: "#C2410C" }}>{profile.name}</span>!
      </h1>
      <h2 className="text-gray-700 dark:text-gray-400">
        Lets find you some compatible roommates through smart matching
      </h2>
    </header>

    {/* holder for all the pages to navigate */}
    <div className="bg-gray-700 dark:bg-gray-900 
                    rounded-lg shadow p-8 text-center">
      
      {/* profile page */}
      <div className="flex gap-6 justify-center flex-wrap">
        <div
          className="border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-500
                      rounded-xl p-6 w-72 cursor-pointer 
                      hover:shadow-md hover:shadow-slate-400 dark:hover:shadow-gray-700 transition-shadow"
          onClick={() => navigate('/profile')}
        >
          <p className="font-bold text-center mb-3 
                      text-black dark:text-white">Account Settings</p>
          <div className="flex items-center gap-6">
            <img
              src={profile.picture}
              alt="Profile"
              className="w-18 h-18 rounded-full object-cover 
                        bg-gray-200 dark:bg-gray-700"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR }}
            />
            <div className="flex flex-col text-left text-sm">
              <span className="font-medium 
                              text-gray-700 dark:text-gray-900">{profile.name}</span>
              <span className="text-gray-500 dark:text-gray-700">{profile.city}, {profile.state}</span>
            </div>
          </div>
        </div>

        {/* messages page */}
        <div
          className="relative border border-gray-200 dark:border-gray-700 
                      rounded-xl p-6 w-72 cursor-pointer 
                      bg-white dark:bg-gray-500
                      hover:shadow-md hover:shadow-slate-400 dark:hover:shadow-gray-700 transition-shadow 
                      text-left"
          onClick={() => navigate('/messages')}
        >
          {unreadCount > 0 && (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-md border-2 border-white dark:border-gray-900">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          <p className="font-bold mb-3 text-center text-black dark:text-white">My Messages</p>
          <p className="text-gray-700 dark:text-gray-900 text-sm">Lets See Who Wants to Chat!</p>
        </div>

        {/* matching page */}
        <div
          className="border border-gray-200 dark:border-gray-700 
                      rounded-xl p-6 w-72 cursor-pointer 
                      bg-white dark:bg-gray-500
                      hover:shadow-md hover:shadow-slate-400 dark:hover:shadow-gray-700 transition-shadow 
                      text-left"
          onClick={() => navigate('/matching')}
        >
          <p className="font-bold mb-3 text-center text-black dark:text-white">Start CoHabiting</p>
          <p className="text-gray-700 dark:text-gray-900 text-sm">Lets get you connected!</p>
        </div>
      </div>
    </div>
  </div>
)}

export default Dashboard
