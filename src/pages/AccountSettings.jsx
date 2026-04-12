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
                                    email: "", 
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

  useEffect(() => {
    async function fetchProfile() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("profiles, preferences")
      .select("email, full_name, avatar_url, bio, date_of_birth, gender, phone, location_city, location_state")
      .eq("id", user.id)
      .single();

      if (data) {
        setForm({
                  email: data.email || "", 
                  full_name: data.full_name || "", 
                  avatar_url: data.avatar_url || "", 
                  bio: data.bio || "", 
                  date_of_birth: data.date_of_birth || "", 
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

  async function SaveSettings() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update values
    const { error: err } = await supabase
    .from('profiles')
    .update({
        full_name: full_name,
        bio: bio,
        gender: gender,
        phone: phone,
        location_city: location_city,
        location_state: location_state,
        date_of_birth: date_of_birth
    })
    .eq('id', user.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Account Settings</h1>
        
    </div>
    </div>
  )
}

export default AccountSettings