import { useState, useEffect, useRef } from 'react'
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


function ProfileSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = profile, 2 = preferences
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // profile stuff
  const [full_name, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [location_city, setCity] = useState('')
  const [location_state, setState] = useState('')
  const [date_of_birth, setDob] = useState('')

  // preferences stuff
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [cleanliness, setCleanliness] = useState(3)
  const [noiseLevel, setNoiseLevel] = useState(3)
  const [sleep_schedule, setSleepSchedule] = useState('')
  const [guests_frequency, setGuestFrequency] = useState('')
  const [property_type, setPropertyType] = useState('')
  const [smoking, setSmoking] = useState(false)
  const [pets, setPets] = useState(false)
  const [deal_breakers, setDealBreakers] = useState(false)


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

  //dropdown logic for gender
  const [genderOpen, setGenderOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGenderOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function saveProfile() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // update the profile that was auto created by our db trigger
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: full_name,
        bio: bio,
        gender: gender,
        phone: phone,
        location_city: location_city,
        location_state: location_state,
        date_of_birth: date_of_birth,
      })
      .eq('id', user.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2) // go to preferences
  }

  async function savePreferences() {
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await supabase
      .from('preferences')
      .upsert({
        user_id: user.id,
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        preferred_location: preferredLocation || null,
        move_in_date: moveInDate || null,
        cleanliness: cleanliness || null,
        noise_level: noiseLevel || null,
        sleep_schedule: sleep_schedule || null,
        guests_frequency: guests_frequency || null,
        smoking: smoking || null,
        pets: pets || null,
        deal_breakers: deal_breakers
        ? deal_breakers.split(",").map(s => s.trim()).filter(Boolean)
        : null
        
      })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/') // all done, go to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to CoHabit!</h1>
        <p className="text-gray-500 text-center mb-6">
          {step === 1 ? 'Tell us about yourself' : 'Set your roommate preferences'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        {step === 1 ? (
          // step 1 - basic profile info
          <form onSubmit={(e) => { e.preventDefault(); saveProfile() }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hi, I'm John!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {gender || 'Select gender'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => setGender(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(***) - *** - ****"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={location_city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {location_state || 'Select state'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {US_STATES.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => setState(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={date_of_birth}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Month / Day / Year"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </form>
        ) : (
          // step 2 - roommate preferences
          <form onSubmit={(e) => { e.preventDefault(); savePreferences() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Schedule</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hover:cursor-pointer w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {sleep_schedule || 'Select sleep schedule'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {['Early Bird', 'Night Owl', 'Flexible'].map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => setSleepSchedule(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Frequency</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hover:cursor-pointer w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {guests_frequency || 'Set guest frequency'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {['Never', 'Sometimes', 'Often', 'No Preference'].map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => setGuestFrequency(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Cleanliness: {cleanliness}/5
              </label>
              <Slider
              className={"bg-gray-200 hover:cursor-grabbing hover:border-2 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-200"}
                min={1}
                max={5}
                step={1}
                value={[cleanliness]}
                onValueChange={(val) => setCleanliness(val[0])}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Noise Level: {noiseLevel}/5
              </label>
              <Slider
              className={"bg-gray-200 hover:cursor-grabbing hover:border-2 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-200"}
                min={1}
                max={5}
                step={1}
                value={[noiseLevel]}
                onValueChange={(val) => setNoiseLevel(val[0])}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                className="hover:cursor-pointer"
                id="smoking"
                checked={smoking}
                onCheckedChange={(val) => setSmoking(val)}
              />
              <label htmlFor="smoking" className="text-sm text-gray-700 cursor-pointer">
                Smoking
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                className="hover:cursor-pointer"
                id="pets"
                checked={pets}
                onCheckedChange={(val) => setPets(val)}
              />
              <label htmlFor="pets" className="text-sm text-gray-700 cursor-pointer">
                Pets
              </label>
            </div>
            <div>
              <label>Date of Moving</label>
              <Calendar
              className="rounded-md border"
              mode="single"
              selected={moveInDate}
              onSelect={setMoveInDate}
            />
            </div>
            <div>
              <label>Preferred Location</label>
              <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='Set your preferred location'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border rounded-md text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {property_type || 'Select preferred property type'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  {['Condo', 'Apartment', 'House'].map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="hover:bg-gray-200" 
                      onClick={() => setPropertyType(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal-Brakers</label>
              <input
                type="text"

                onChange={(e) => setDealBreakers(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter comma-separated list of deal-breakers"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProfileSetup
