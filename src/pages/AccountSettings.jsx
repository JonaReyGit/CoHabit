import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Slider 
} from '@/components/ui/slider' 
import {
  Checkbox
} from '@/components/ui/checkbox'
import {
  Calendar, 
  CalendarDayButton
} from '@/components/ui/calendar'

function AccountSettings() {
  const [form, setForm] = useState({
                                    full_name: "", 
                                    avatar_url: "", 
                                    bio: "", 
                                    date_of_birth: "", 
                                    gender: "", 
                                    phone: "", 
                                    location_city: "", 
                                    location_state: ""})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editName, setEditName] = useState(false)
  const [editBio, setEditBio] = useState(false)
  const [editGender, setEditGender] = useState(false)
  const [editDob, setEditDob] = useState(false)
  const [editPhone, setEditPhone] = useState(false)
  const [editCity, setEditCity] = useState(false)
  const [editState, setEditState] = useState(false)
  

  useEffect(() => {
    async function fetchProfile() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("profiles")
      .select("full_name, avatar_url, bio, date_of_birth, gender, phone, location_city, location_state")
      .eq("id", user.id)
      .single();

      if (data) {
        setForm({
                  full_name: data.full_name || "", 
                  avatar_url: data.avatar_url || "", 
                  bio: data.bio || "", 
                  date_of_birth: data.date_of_birth || null, 
                  gender: data.gender || "", 
                  phone: data.phone || "", 
                  location_city: data.location_city || "", 
                  location_state: data.location_state || "",
        });
      }
      setLoading(false)
    }
    fetchProfile();
  }, []);

  async function saveSettings() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update values
    const { error } = await supabase
    .from('profiles')
    .update({
        full_name: form.full_name,
        bio: form.bio,
        gender: form.gender,
        phone: form.phone,
        location_city: form.location_city,
        location_state: form.location_state,
        date_of_birth: form.date_of_birth
    })
    .eq('id', user.id)

    if (error) {
      console.error("Supabase error:", error.message);
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
    

        <form onSubmit={(e) => { e.preventDefault(); saveSettings() }} className="space-y-4">
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editName ? (
              <>
                <input
                type="text"
                onChange={e => setForm({...form, full_name: e.target.value})}
                placeholder="Enter your name"
                className="mt-2 w-full border rounded-lg px-3 py-2"
                />
                <button
                type="button" 
                onClick={() => setEditName(false)}
                className="flex-1 mx-2 my-2 px-2 bg-red-400 text-white rounded-md hover:bg-red-700 hover: cursor-pointer disabled:opacity-50"
                >Cancel
              </button>
            <button
              type="button" 
              onClick={(e) => {
                saveSettings()
                setEditName(false)
              }}
              className="flex-1 my-2 px-2 bg-blue-400 text-white rounded-md hover:bg-blue-700 hover: cursor-pointer disabled:opacity-50"
              >Confirm
            </button>
            </>
            ) : (
              <>
              <div className="flex flex-col gap-2">
                {form.full_name}
                <button
                type="button" 
                onClick={() => setEditName(true)}
                className="w-fit px-2 bg-gray-400 text-white rounded-md hover:bg-gray-700 hover: cursor-pointer disabled:opacity-50"
                >Edit
                </button>
              </div>
            </>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editBio ? (
              <>
              <input
              type="text"
              onChange={e => setForm({...form, bio: e.target.value})}
              placeholder="Enter new bio"
              className="mt-2 w-full border rounded-lg px-3 py-2"
              />
              <button
              type="button" 
              onClick={() => setEditBio(false)}
              className="flex-1 mx-2 my-2 px-2 bg-red-400 text-white rounded-md hover:bg-red-700 hover: cursor-pointer disabled:opacity-50"
              >Cancel
            </button>
            <button
              type="button" 
              onClick={e => {
                saveSettings()
                setEditBio(false)
              }}
              className="flex-1 my-2 px-2 bg-blue-400 text-white rounded-md hover:bg-blue-700 hover: cursor-pointer disabled:opacity-50"
              >Confirm
            </button>
            </>
            ) : (
              <>
              {form.bio}
              <div className="flex flex-col gap-2"></div>
              <button
              type="button" 
              onClick={() => setEditBio(true)}
              className="w-fit px-2 bg-gray-400 text-white rounded-md hover:bg-gray-700 hover: cursor-pointer disabled:opacity-50"
              >Edit
              </button>
            </>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {editGender ? (
              <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {form.gender || 'Select gender'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => {setForm({...form, gender: option});
                        saveSettings()
                        setEditGender(false)
                      }}
                      
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
            ) : (
              <>
              {form.gender}
              <div className="flex flex-col gap-2"></div>
              <button
              type="button" 
              onClick={() => setEditGender(true)}
              className="w-fit px-2 bg-gray-400 text-white rounded-md hover:bg-gray-700 hover: cursor-pointer disabled:opacity-50"
              >Edit
              </button>
            </>
            )}
          </div>
          
        </form>
      </div>
    </div>
    </>
  )
}

export default AccountSettings