import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs'

import {
  Slider 
} from '@/components/ui/slider' 

function AccountSettings() {
  const [form_prof, setFormProf] = useState({
                                    full_name: "", 
                                    avatar_url: "", 
                                    bio: "", 
                                    date_of_birth: "", 
                                    gender: "", 
                                    phone: "", 
                                    location_city: "", 
                                    location_state: ""})

  const [form_preferences, setFormPreferences] = useState({
                                                  budget_min: null, 
                                                  budget_max: null, 
                                                  preferred_location: "", 
                                                  move_in_date: null, 
                                                  cleanliness: null, 
                                                  noise_level: null, 
                                                  sleep_schedule: "",
                                                  smoking: null,
                                                  pets: null,
                                                  deal_breakers: "",
    })

  const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("profiles")
      .select("full_name, avatar_url, bio, date_of_birth, gender, phone, location_city, location_state")
      .eq("id", user.id)
      .single();

      if (data) {
        setFormProf({
                  full_name: data.full_name || null, 
                  avatar_url: data.avatar_url || null, 
                  bio: data.bio || null, 
                  date_of_birth: data.date_of_birth || null, 
                  gender: data.gender || null, 
                  phone: data.phone || null, 
                  location_city: data.location_city || null, 
                  location_state: data.location_state || null,
        });
      }
      setLoading(false)
    }
    fetchProfile();

    async function fetchPreferences() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("preferences")
      .select("budget_min, budget_max, preferred_location, move_in_date, cleanliness, noise_level, sleep_schedule, guests_frequency, smoking, pets, deal_breakers, property_type")
      .eq("user_id", user.id)
      .maybeSingle();

      if (data) {
        setFormPreferences({
                  budget_min: data.budget_min || null, 
                  budget_max: data.budget_max || null, 
                  preferred_location: data.preferred_location || null, 
                  move_in_date: data.move_in_date || null, 
                  cleanliness: data.cleanliness || null, 
                  noise_level: data.noise_level || null, 
                  sleep_schedule: data.sleep_schedule || null,
                  smoking: data.smoking || null,
                  pets: data.pets || null,
                  deal_breakers: data.deal_breakers || null,
        });
      }
      setLoading(false)
    }
    fetchPreferences();

  }, []);


  async function saveProfile() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update values
    const { error } = await supabase
    .from('profiles')
    .update({
        full_name: form_prof.full_name,
        bio: form_prof.bio,
        gender: form_prof.gender,
        phone: form_prof.phone,
        location_city: form_prof.location_city,
        location_state: form_prof.location_state,
        date_of_birth: form_prof.date_of_birth
    })
    .eq('id', user.id)

    if (error) {
      console.error("Supabase error:", error.message);
      setLoading(false)
      return
    }

    setLoading(false)
  }

  async function savePreferences() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update values
    const { error } = await supabase
    .from('preferences')
    .update({
        budget_min: form_preferences.budget_min, 
        budget_max: form_preferences.budget_max, 
        preferred_location: form_preferences.preferred_location, 
        move_in_date: form_preferences.move_in_date, 
        cleanliness: form_preferences.cleanliness, 
        noise_level: form_preferences.noise_level, 
        sleep_schedule: form_preferences.sleep_schedule,
        smoking: form_preferences.smoking,
        pets: form_preferences.pets,
        deal_breakers: form_preferences.deal_breakers
    })
    .eq('user_id', user.id)

    if (error) {
      console.error("Supabase error:", error.message);
      setLoading(false)
      return
    }

    setLoading(false)
  }

  function EditableField({ label, value, onConfirm, placeholder, inputType = "text", options = [] }) {
    useEffect(() => {
      if (!isEditing) {
        setTemp(value);
      }
    }, [value]);

    const [isEditing, setIsEditing] = useState(false);
    const [temp, setTemp] = useState(value);

    const handleConfirm = () => {
      setIsEditing(false);
      onConfirm(temp);
    };

    const handleCancel = () => {
      setIsEditing(false);
      setTemp(value);
    };

    const renderInput = () => {
      if (inputType === "textarea") {
        return (
          <textarea
            value={temp}
            onChange={e => setTemp(e.target.value)}
            placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2"
          />
        );
      }

      if (inputType === "select") {
        return (
          <select
            value={temp}
            onChange={e => setTemp(e.target.value)}
            className="mt-2 w-full border rounded-lg px-3 py-2"
          >
          <option value="" disabled>Select an option</option>
            {options.map(opt => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return <option key={val} value={val}>{lbl}</option>;
          })}
          </select>
        );
      }

      if (inputType == "slider") {
          return (
            <div>
              <span className='text-md my-6'>{temp}/5</span>
          <Slider
            className={"bg-gray-200 hover:cursor-grabbing my-2 hover:border-2 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-200"}
            min={1}
            max={5}
            step={1}
            value={[temp]}
            onValueChange={(val) => setTemp(val[0])}
          />
          </div>
          );
        }

      // default: text, email, number, date, etc.
      return (
        <input
          type={inputType}
          value={temp}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
          onChange={e => setTemp(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full border rounded-lg px-3 py-2"
        />
      );
    };

  return (
    <>
      <label className="block text-lg font-medium text-gray-700 mb-1 whitespace-nowrap">{label}</label>
      {isEditing ? (
        <>
          {renderInput()}
          <button type="button" onClick={handleCancel}
            className="flex-1 mx-2 my-2 px-2 bg-red-400 text-white rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm}
            className="flex-1 my-2 px-2 bg-blue-400 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50">
            Confirm
          </button>
        </>
      ) : (
        <div className="flex flex-col items-start justify-between">
          <span className="bg-gray-200 rounded-xl px-3 py-2 items-center flex-cent">{value}</span>
          <button type="button" 
          onClick={() => setIsEditing(true)}
          className="w-fit my-2 px-2 bg-gray-400 text-white rounded-md hover:bg-gray-700 hover: cursor-pointer disabled:opacity-50"
          >Edit</button>
        </div>
      )}
    </>
  );
}



  return (
    <>
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full mx-5max-h-180 bg-white rounded-lg shadow-xl  p-12">
        <div className='p-5 rounded-2xl bg-blue-600'>
        <h1 className="text-2xl text-white font-bold mb-2">Account Settings</h1>
        </div>

        <div className="flex">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger className="data-[state=active]:bg-blue-500 data-[state=active]:text-white mx-2 bg-blue-100 hover:bg-blue-200" value="profile">Profile</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-blue-500 data-[state=active]:text-white mx-2 bg-blue-100 hover:bg-blue-200" value="preferences">Preferences</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-blue-500 data-[state=active]:text-white bg-blue-100 hover:bg-blue-200" value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              {<form onSubmit={(e) => { e.preventDefault(); saveProfile() }} className="space-y-5">
                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      label="Full Name"
                      value={form_prof.full_name}
                      placeholder="Enter your name"
                      onConfirm={(val) => setFormProf({ ...form_prof, full_name: val })}
                    />
                  </div>
                  <div>
                    <EditableField
                      label="Phone Number"
                      value={form_prof.phone}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setFormProf({ ...form_prof, phone: val })}
                    />
                  </div>
                </div>

                <div className='grid items-start'>
                  <EditableField
                      label="Bio"
                      inputType="textarea"
                      value={form_prof.bio}
                      placeholder="Enter your bio"
                      onConfirm={(val) => setFormProf({ ...form_prof, bio: val })}
                    />
                </div>

                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      label="Gender"
                      inputType='select'
                      options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                      { value: "Prefer not to say", label: "Prefer not to say" },
                    ]}
                      value={form_prof.gender}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setFormProf({ ...form_prof, gender: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Date of Birth"
                      inputType="date"
                      value={form_prof.date_of_birth}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setFormProf({ ...form_prof, date_of_birth: val })}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      label="City"
                      value={form_prof.location_city}
                      placeholder="Enter your city"
                      onConfirm={(val) => setFormProf({ ...form_prof, location_city: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="State"
                      inputType='select'
                      options={US_STATES}
                      value={form_prof.location_state}
                      placeholder="Enter your state"
                      onConfirm={(val) => setFormProf({ ...form_prof, location_state: val })}
                    />
                  </div>
                </div>
              
                <button
                type="submit"
                className="border-black py-3 px-5 text-white bg-blue-500 rounded-2xl hover:bg-blue-600">Submit</button>
              </form>}
            </TabsContent>

            <TabsContent value="preferences">
              {<form onSubmit={(e) => { e.preventDefault(); savePreferences() }} className="space-y-4">
                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      inputType="number"
                      label="Budget Min."
                      value={form_preferences.budget_min}
                      placeholder="700"
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, budget_min: val })}
                    />
                  </div>
                  <div>
                    <EditableField
                      label="Budget Max"
                      value={form_preferences.budget_max}
                      placeholder="1500"
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, budget_max: val })}
                    />
                  </div>
                  <div>
                  <EditableField
                      inputType="slider"
                      label="Cleanliness"
                      value={form_preferences.cleanliness}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, cleanliness: val })}
                    />
                  </div>

                  <div>
                  <EditableField
                      inputType="slider"
                      label="Noise Level"
                      value={form_preferences.noise_level}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, noise_level: val })}
                    />
                  </div>

                  <button
                type="submit"
                className="border-black py-3 px-5 text-white bg-blue-500 rounded-2xl hover:bg-blue-600">Submit</button>
                </div>
              </form>
              }
            </TabsContent>

            <TabsContent value="account">
              {/* account fields here */}
            </TabsContent>
          </Tabs>
        </div>

        
      </div>
    </div>
    </>
  )
}

export default AccountSettings