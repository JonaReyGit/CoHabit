import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs'

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
import Footer from "@/components/shared/Footer"

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

const EditableField = forwardRef(function EditableField({ label, value, onConfirm, placeholder, renderDisplay, inputType = "text", options = [] }, ref) {
    const [isEditing, setIsEditing] = useState(false);
    const [temp, setTemp] = useState(value);

    useImperativeHandle(ref, () => ({
      startEditing: ()=> {
        console.log("start editing called")
        setIsEditing(true)}
    }));

    useEffect(() => {
      if (!isEditing) {
        setTemp(value);
      }
    }, [value]);

    const handleConfirm = () => {
      console.log("Confirming temp value:", temp);
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
            className="w-full border bg-white dark:bg-gray-800 rounded-lg px-3 py-2"
          />
        );
      }

      if (inputType === "select") {
        return (
          <select
            value={temp}
            onChange={e => setTemp(e.target.value)}
            className="mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg px-3 py-2"
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
                className={"bg-white hover:cursor-grabbing my-2 hover:border-2 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-200"}
                min={1}
                max={5}
                step={1}
                value={[temp]}
                onValueChange={(val) => setTemp(val[0])}
              />
            </div>
          );
        }

        if (inputType == "checkbox") {
          return (
            <div>
              <Checkbox
                className="bg-white dark:bg-gray-800 hover:cursor-pointer dark:data-[state=checked]:bg-gray-800"
                id={label}
                checked={temp}
                onCheckedChange={(val) => setTemp(val)}
              />
          </div>
          );
        }

        if (inputType == "calendar") {
          return (
            <div>
              <Calendar
              className="bg-white dark:bg-gray-800 rounded-md border"
              mode="single"
              selected={temp}
              onSelect={(val) => setTemp(val)}
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
          className="bg-white dark:bg-gray-800 mt-2 w-full border rounded-lg px-3 py-2"
        />
      );
    };

  return (
    <>
      <label className="block text-lg font-medium dark:text-white text-gray-700 mb-1 whitespace-nowrap">{label}</label>
      {isEditing ? (
        <>
          {renderInput()}
          <div className="flex">
          <button type="button" onClick={handleCancel}
            className="mx-2 my-2 px-2 dark:bg-red-600 bg-red-400 text-white rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm}
            className="my-2 px-2 dark:bg-blue-600 bg-blue-400 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50">
            Confirm
          </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start justify-between">
           {renderDisplay ? renderDisplay(value) : (
            <span className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-64 min-h-[2.5rem] inline-block">{value}</span>
          )}
          <button type="button" 
          onClick={() => setIsEditing(true)}
          className="w-fit my-2 px-2 bg-gray-400  text-white rounded-md hover:bg-gray-700 hover:cursor-pointer hover:dark:bg-gray-800 disabled:opacity-50"
          >Edit</button>
        </div>
      )}
    </>
  );
});


function AccountSettings() {
  const [form_prof, setFormProf] = useState({
                                    email: "",
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
                                                  preferred_location: null, 
                                                  move_in_date: null, 
                                                  cleanliness: null, 
                                                  noise_level: null, 
                                                  sleep_schedule: null,
                                                  guests_frequency: null,
                                                  smoking: null,
                                                  pets: null,
                                                  property_type: null,
                                                  deal_breakers: null,
    })
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    async function fetchProfile() {
      const {data: { user } } = await supabase.auth.getUser(); 

      const { data, error } = await supabase 
      .from("profiles")
      .select("email, full_name, avatar_url, bio, date_of_birth, gender, phone, location_city, location_state")
      .eq("id", user.id)
      .single();

      if (data) {
        setFormProf({
                  email: data.email || null,
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
                  guests_frequency: data.guests_frequency || null,
                  smoking: data.smoking || null,
                  pets: data.pets || null,
                  property_type: data.property_type || null,
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
        email: form_prof.email,
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
        guests_frequency: form_preferences.guests_frequency,
        smoking: form_preferences.smoking,
        pets: form_preferences.pets,
        property_type: form_preferences.property_type,
        deal_breakers: typeof form_preferences.deal_breakers === "string"
                                                                ? form_preferences.deal_breakers.split(",").map(s => s.trim()).filter(Boolean)
                                                                : form_preferences.deal_breakers ?? null,
    })
    .eq('user_id', user.id)

    if (error) {
      console.error("Supabase error:", error.message);
      setLoading(false)
      return
    }

    setLoading(false)
  }


  return (
    <>
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full mx-5max-h-180 bg-[#b2dcf1b9] dark:bg-gray-700 rounded-lg shadow-xl  p-12">
        <div className='p-5 rounded-2xl bg-[#659af6] dark:bg-gray-900'>
        <h1 className="text-2xl text-white font-bold mb-2">Account Settings</h1>
        </div>

        <div className="flex">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger className="data-[state=active]:bg-blue-500 dark:border-blue-900 dark:hover:bg-blue-900 dark:data-[state=active]:bg-black dark:bg-gray-800 data-[state=active]:text-white mx-2 bg-blue-100 hover:bg-blue-200" value="profile">Profile</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-blue-500 dark:border-blue-900 dark:hover:bg-blue-900 dark:data-[state=active]:bg-black dark:bg-gray-800 data-[state=active]:text-white mx-2 bg-blue-100 hover:bg-blue-200" value="preferences">Preferences</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-blue-500 dark:border-blue-900 dark:hover:bg-blue-900 dark:data-[state=active]:bg-black dark:bg-gray-800 data-[state=active]:text-white mx-2 bg-blue-100 hover:bg-blue-200" value="account">Account</TabsTrigger>
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
                      renderDisplay={(val) => (
                        <textarea
                        value={val}
                        readOnly
                        className=" bg-gray-100 dark:bg-gray-800 w-full border rounded-lg px-3 py-2"/>
                      )}
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
              
                  <div>
                    <button
                    type="submit"
                    className="py-3 px-5 text-white bg-blue-500 dark:bg-gray-800 dark:hover:bg-gray-900 rounded-2xl hover:bg-blue-600 hover:cursor-pointer">
                    Submit
                    </button>
                  </div>
              </form>}
            </TabsContent>

            <TabsContent value="preferences">
              {<form onSubmit={(e) => { e.preventDefault(); savePreferences() }} className="space-y-4">
                <div className='grid grid-cols-2 gap-20 items-start'>
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
                      inputType="number"
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

                  <div>
                    <EditableField
                      label="Sleep Schedule"
                      inputType='select'
                      options={[
                      { value: "Early Bird", label: "Early Bird" },
                      { value: "Night Owl", label: "Night Owl" },
                      { value: "No Preference", label: "No Preference" },
                    ]}
                      value={form_preferences.sleep_schedule}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, sleep_schedule: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Guest Frequency"
                      inputType='select'
                      options={[
                      { value: "Never", label: "Never" },
                      { value: "Sometimes", label: "Sometimes" },
                      { value: "Often", label: "Often" },
                      { value: "No Preference", label: "No Preference" },
                    ]}
                      value={form_preferences.guests_frequency}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, guests_frequency: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                    inputType='checkbox'
                      label="pets"
                      value={form_preferences.pets}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, pets: val })}
                      renderDisplay={(val) => (
                      <input type="checkbox" checked={!!val} readOnly className="dark:dark:accent-gray-800" />
                    )}
                    />
                  </div>

                  <div>
                    <EditableField
                    inputType='checkbox'
                      label="smoking"
                      value={form_preferences.smoking}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, smoking: val })}
                      renderDisplay={(val) => (
                      <input type="checkbox" checked={!!val} readOnly className="dark:accent-gray-800" />
                    )}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Preferred Location"
                      value={form_preferences.preferred_location}
                      placeholder="Enter your preferred location"
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, preferred_location: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                    inputType='calendar'
                      label="Move-in Date"
                      value={form_preferences.move_in_date}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, move_in_date: val })}
                      renderDisplay={(val) => (
                      <span className="bg-gray-200 dark:bg-gray-800 rounded-xl px-3 py-2">
                        {val ? new Date(val).toLocaleDateString() : "Not set"}
                      </span>
                      )}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Property Type"
                      inputType='select'
                      options={[
                      { value: "Condo", label: "Condo" },
                      { value: "Apartment", label: "Apartment" },
                      { value: "House", label: "House" },
                    ]}
                      value={form_preferences.property_type}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, property_type: val })}
                    />
                  </div>

                  <div>
                    <EditableField
                      label="Deal-Breakers"
                      value={form_preferences.deal_breakers}
                      onConfirm={(val) => setFormPreferences({ ...form_preferences, deal_breakers: val })}
                    />
                  </div>
                  
                  <div>
                    <button
                    type="submit"
                    className="py-3 px-5 text-white bg-blue-500 dark:bg-gray-800 dark:hover:bg-gray-900 rounded-2xl hover:bg-blue-600 hover:cursor-pointer">
                      Submit
                      </button>
                  </div>
                </div>
              </form>
              }
            </TabsContent>

            <TabsContent value="account">
              {
                <div className='grid grid-cols-2 gap-30 items-start'>
                  <div>
                    <EditableField
                      label="Email"
                      value={form_prof.email}
                      placeholder="Enter your new email"
                      onConfirm={async (val) => {
                        const { error } = await supabase.auth.updateUser({ email: val });
                        if (!error) {
                        await supabase
                      .from('profiles')
                      .update({ email: val })
                      .eq('id', user.id);
                    }
                      }}
                    />
                  </div>
                  <div>
                    <EditableField
                      label="New Password"
                      inputType="password"
                      value=""
                      placeholder="Enter new password"
                      onConfirm={(val) => {
                        setNewPassword(val);
                        console.log("ref: ", confirmPasswordRef.current)
                        confirmPasswordRef.current?.startEditing();
                    }}
                    />

                    <EditableField
                      ref={confirmPasswordRef}
                      label="Confirm Password"
                      inputType='password'
                      value=""
                      placeholder="Confirm new password"
                      onConfirm={async (val) => {
                        if (val !== newPassword) {
                          alert("Passwords do not match!");
                          return;
                        }
                        const { error } = await supabase.auth.updateUser({password: newPassword});
                        if (error) console.error(error);
                        else alert("Password updated!!")
                      }}
                    />
                  </div>
                </div>}
            </TabsContent>
          </Tabs>
        </div>  
      </div>
    </div>
    <div>
      <Footer />
    </div>
    </>
  )
}

export default AccountSettings