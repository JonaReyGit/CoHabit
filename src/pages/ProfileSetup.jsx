import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProfileSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = profile, 2 = preferences
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // profile stuff
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [dob, setDob] = useState('')

  // preferences stuff
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [cleanliness, setCleanliness] = useState(3)
  const [noiseLevel, setNoiseLevel] = useState(3)
  const [sleepSchedule, setSleepSchedule] = useState('')
  const [guestsFrequency, setGuestsFrequency] = useState('')
  const [smoking, setSmoking] = useState(false)
  const [pets, setPets] = useState(false)

  //dropdown for gender
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
        full_name: fullName,
        bio: bio,
        gender: gender,
        phone: phone,
        city: city,
        state: state,
        dob: dob
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
        // TODO: add the rest of the preference fields here
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            {/* TODO: add inputs for bio, gender, phone, city, state, dob */}
            {/* just copy the same pattern as the full name input above */}
            
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hi, I'm John!"
              />
            </div>
            
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                onCLick={() =>setGenderOpen(!genderOpen)}
                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-black/10">
                {gender}
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="-mr-1 size-5 text-gray-400">
                  <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
              </button>

              {genderOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-gray-800 outline outline-1 outline-white/10">
                  <div className="py-1">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                    <button
                    key={option}
                    type="button"
                    onClick={() => {setGender(option); setGenderOpen(false)}} 
                    className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      {option}
                    </button>
                  ))}
                  </div>
                </div>
              )}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="text"
                value={dob}
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

            {/* TODO: add the rest of the preference inputs */}
            {/* sleep_schedule - could be a dropdown (early bird, night owl, flexible) */}
            {/* guests_frequency - dropdown (never, sometimes, often) */}
            {/* cleanliness and noise_level - maybe a 1-5 slider or just number input */}
            {/* smoking and pets - checkboxes */}
            {/* move_in_date - date picker */}
            {/* preferred_location - text input */}

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
