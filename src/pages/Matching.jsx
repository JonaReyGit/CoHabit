import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Footer from "@/components/shared/Footer";

export default function Matching() {
    const navigate = useNavigate()
    const [genderFilter, setGenderFilter] = useState('all')
    const [searchText, setSearchText] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [myPreferences, setMyPreferences] = useState(null)
    const [users, setUsers] = useState([])


    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // fetch my preferences
            const { data: myPrefs } = await supabase
                .from('preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (myPrefs) setMyPreferences(myPrefs)

            // fetch all other users profiles + their preferences
            const { data: otherUsers } = await supabase
                .from('profiles')
                .select(`*, preferences(*)`)
                .neq('id', user.id)

            if (otherUsers) {
                const formatted = otherUsers.map(u => ({
                    id: u.id,
                    name: u.full_name || u.email,
                    letter: (u.full_name || u.email || '?')[0].toUpperCase(),
                    location: u.preferences?.preferred_location || 'Unknown',
                    gender: u.gender || 'Unknown',
                    budget: `$${u.preferences?.budget_min || '?'}–$${u.preferences?.budget_max || '?'}/mo`,
                    type: u.preferences?.property_type || 'Unknown',
                    budget_min: u.preferences?.budget_min,
                    budget_max: u.preferences?.budget_max,
                    sleep_schedule: u.preferences?.sleep_schedule,
                    cleanliness: u.preferences?.cleanliness,
                    noise_level: u.preferences?.noise_level,
                    smoking: u.preferences?.smoking,
                    pets: u.preferences?.pets,
                }))
                setUsers(formatted)
            }
        }

        fetchData()
    }, [])

    const calculateScore = (otherUser) => {
        if (!myPreferences || !otherUser) return 0
        let score = 0

        // budget overlap
        if (myPreferences.budget_min && otherUser.budget_min) {
            const myMin = myPreferences.budget_min
            const myMax = myPreferences.budget_max
            const theirMin = otherUser.budget_min
            const theirMax = otherUser.budget_max
            if (myMin <= theirMax && theirMin <= myMax) score += 25
        }

        // sleep schedule match
        if (myPreferences.sleep_schedule && otherUser.sleep_schedule) {
            if (myPreferences.sleep_schedule === otherUser.sleep_schedule) score += 25
        }

        // cleanliness match (within 1 point)
        if (myPreferences.cleanliness && otherUser.cleanliness) {
            if (Math.abs(myPreferences.cleanliness - otherUser.cleanliness) <= 1) score += 20
        }

        // smoking match
        if (myPreferences.smoking === otherUser.smoking) score += 15

        // pets match
        if (myPreferences.pets === otherUser.pets) score += 15

        return score
    }

    const handleConnect = async (otherUser) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // needs to save the match to the database
        const { error } = await supabase
            .from('matches')
            .insert({
                user_id_1: user.id,
                user_id_2: otherUser.id,
                compatibility_score: otherUser.score,
                status: 'accepted'
            })

        // Violation error code:23505 is Postgre unique_violation error code
         
        // If the match already exists ignore the error and just navigate
        if (error && error.code !== '23505') {
            console.error("Error creating match:", error)
            return
        }

        navigate('/messages')
    }

    const scored = users.map(user => ({
        ...user,
        score: calculateScore(user)
    }))

    const filtered = scored.filter(user => {
        const matchesGender = genderFilter === 'all' || user.gender === genderFilter
        const matchesType = typeFilter === 'all' || user.type === typeFilter
        const city = user.location.split(', ')[0]
        const matchesLocation = city.toLowerCase().startsWith(searchText.toLowerCase())
        return matchesGender && matchesType && matchesLocation
    }).sort((a, b) => b.score - a.score)

    return (
        <div className="min-h-screen bg-[#b2dcf1b9]">

            {/* header */}
            <div className="bg-[#659af6] px-6 py-16 text-center">
                <h1 className="text-4xl font-bold text-black">Find a Roommate</h1>
                <p className="text-gray-900 text-lg mt-2">Browse and filter potential roommates</p>
            </div>
            {/* search and filter */}
            <div className="px-6 py-4 flex flex-col gap-3">
                {/* search row */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search by city..."
                        onChange={e => setSearchText(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Filter
                    </button>
                </div>
                {/* filter buttons row */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setGenderFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'all' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        All
                    </button>
                    <button onClick={() => setGenderFilter('Male')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'Male' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Male
                    </button>
                    <button onClick={() => setGenderFilter('Female')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'Female' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Female
                    </button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <button onClick={() => setTypeFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'all' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        All Types
                    </button>
                    <button onClick={() => setTypeFilter('Apartment')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'Apartment' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Apartment
                    </button>
                    <button onClick={() => setTypeFilter('House')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'House' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        House
                    </button>
                    <button onClick={() => setTypeFilter('Condo')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'Condo' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Condo
                    </button>
                </div>
            </div>


            {/* user cards */}
            <div className="px-6 py-4 grid grid-cols-3 gap-4">
                {filtered.map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex flex-col gap-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                                {user.letter}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.location}</p>
                            </div>
                            <span className="ml-auto text-sm font-bold text-blue-600">{user.score}% Match</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{user.gender}</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{user.type}</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{user.budget}</span>
                            {user.smoking && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">🚬 Smoking OK</span>}
                            {user.pets && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">🐾 Pets OK</span>}

                        </div>
                        <button
                        onClick={() => handleConnect(user)}
                            className="mt-3 w-full bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700"
                        >
                            Message
                        </button>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    )
}
