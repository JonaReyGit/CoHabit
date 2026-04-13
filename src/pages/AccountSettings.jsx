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
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs'


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

  const [full_name, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [date_of_birth, setDob] = useState(null)
  const [location_city, setCity] = useState('')
  const [location_state, setState] = useState('')


  // preferences stuff
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [cleanliness, setCleanliness] = useState(3)
  const [noiseLevel, setNoiseLevel] = useState(3)
  const [sleep_schedule, setSleepSchedule] = useState('')
  const [guests_frequency, setGuestFrequency] = useState('')
  const [smoking, setSmoking] = useState(false)
  const [pets, setPets] = useState(false)
  
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

    async function fetchPreferences() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("preferences")
      .select("budget_min, budget_max, preferred_location, move_in_date, cleanliness, noise_level, sleep_schedule, guests_frequency, smoking, pets, deal_breakers, property_type")
      .eq("id", user.id)
      .single();

      if (data) {
        setForm({
                  budget_min: data.budget_min || null, 
                  budget_max: data.budget_max || null, 
                  preferred_location: data.preferred_location || null, 
                  move_in_date: data.move_in_date || null, 
                  cleanliness: data.cleanliness || null, 
                  noise_level: data.noise_level || null, 
                  sleep_schedule: data.sleep_schedule || "",
                  smoking: data.smoking || null,
                  pets: data.pets || null,
                  deal_breakers: data.deal_breakers || "",
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

  async function savePreferences() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update values
    const { error } = await supabase
    .from('preferences')
    .update({
        budget_min: form.budget_min, 
        budget_max: form.budget_max, 
        preferred_location: form.preferred_location, 
        move_in_date: form.move_in_date, 
        cleanliness: form.cleanliness, 
        noise_level: form.noise_level, 
        sleep_schedule: form.sleep_schedule,
        smoking: form.smoking,
        pets: form.pets,
        deal_breakers: form.deal_breakers
    })
    .eq('id', user.id)

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

        if (inputType == "number") {
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
        }
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
                      value={form.full_name}
                      placeholder="Enter your name"
                      onConfirm={(val) => setForm({ ...form, full_name: val })}
                    />
                  </div>
                  <div>
                    <EditableField
                      label="Phone Number"
                      value={form.phone}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setForm({ ...form, phone: val })}
                    />
                  </div>
                </div>

                <div className='grid items-start'>
                  <EditableField
                      label="Bio"
                      inputType="textarea"
                      value={form.bio}
                      placeholder="Enter your bio"
                      onConfirm={(val) => setForm({ ...form, bio: val })}
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
                      value={form.gender}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setForm({ ...form, gender: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Date of Birth"
                      inputType="date"
                      value={form.date_of_birth}
                      placeholder="Enter your phone"
                      onConfirm={(val) => setForm({ ...form, date_of_birth: val })}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      label="City"
                      value={form.location_city}
                      placeholder="Enter your city"
                      onConfirm={(val) => setForm({ ...form, location_city: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="State"
                      inputType='select'
                      options={US_STATES}
                      value={form.location_state}
                      placeholder="Enter your state"
                      onConfirm={(val) => setForm({ ...form, location_state: val })}
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
                      value={form.budget_min}
                      placeholder="700"
                      onConfirm={(val) => setForm({ ...form, budget_min: val })}
                    />
                  </div>
                  <div>
                    <EditableField
                      label="Budget Max"
                      value={form.budget_max}
                      placeholder="1500"
                      onConfirm={(val) => setForm({ ...form, budget_max: val })}
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