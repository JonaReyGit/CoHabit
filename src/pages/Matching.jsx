import { useState } from 'react'

export default function Matching() {
    const [genderFilter, setGenderFilter] = useState('all')
    const [searchText, setSearchText] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const users = [
        { letter: 'A', name: 'Alex Johnson', location: 'Orlando, FL', gender: 'Male', budget: '$700–$900/mo', type: 'Apartment' },
        { letter: 'M', name: 'Mary Smith', location: 'Tampa, FL', gender: 'Female', budget: '$600–$900/mo', type: 'Apartment' },
        { letter: 'R', name: 'Robert Campos', location: 'Gainesville, FL', gender: 'Male', budget: '$900–$1,100/mo', type: 'House' },
        { letter: 'J', name: 'Jessica Jones', location: 'Lakeland, FL', gender: 'Female', budget: '$600–$1,000/mo', type: 'Apartment' },
        { letter: 'S', name: 'Stephanie Garcia', location: 'Orlando, FL', gender: 'Female', budget: '$700–$1,300/mo', type: 'Condo' },
        { letter: 'T', name: 'Thomas Brown', location: 'Kissimmee, FL', gender: 'Male', budget: '$900–$1,250/mo', type: 'House' },
        { letter: 'D', name: 'David Fuentes', location: 'Gainesville, FL', gender: 'Male', budget: '$600–$1,100/mo', type: 'Apartment' },
        { letter: 'F', name: 'Francis Carter', location: 'Miami, FL', gender: 'Male', budget: '$900–$2,000/mo', type: 'Apartment' },
        { letter: 'C', name: 'Cierra Truman', location: 'Jacksonville, FL', gender: 'Female', budget: '$800–$1,500/mo', type: 'House' },
        { letter: 'B', name: "Brad O'Neil", location: 'Miami, FL', gender: 'Male', budget: '$1,000–$1,900/mo', type: 'Condo' },
        { letter: 'E', name: 'Emily Martinez', location: 'Lakeland, FL', gender: 'Female', budget: '$700–$900/mo', type: 'House' },
        { letter: 'G', name: 'George Larson', location: 'Tampa, FL', gender: 'Male', budget: '$800–$1,000/mo', type: 'Condo' },
    ]

    const filtered = users.filter(user => {
        const matchesGender = genderFilter === 'all' || user.gender === genderFilter
        const matchesType = typeFilter === 'all' || user.type === typeFilter
        const city = user.location.split(', ')[0]
        const matchesLocation = city.toLowerCase().startsWith(searchText.toLowerCase())

        return matchesGender && matchesType && matchesLocation
    })


    return (
        <div className="min-h-screen bg-gray-50">

            {/* header */}
            <div className="bg-white shadow-sm px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-800">Find a Roommate</h1>
                <p className="text-gray-500 text-sm mt-1">Browse and filter potential roommates</p>
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
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        All
                    </button>
                    <button onClick={() => setGenderFilter('Male')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'Male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Male
                    </button>
                    <button onClick={() => setGenderFilter('Female')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${genderFilter === 'Female' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Female
                    </button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <button onClick={() => setTypeFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        All Types
                    </button>
                    <button onClick={() => setTypeFilter('Apartment')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'Apartment' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Apartment
                    </button>
                    <button onClick={() => setTypeFilter('House')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'House' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        House
                    </button>
                    <button onClick={() => setTypeFilter('Condo')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${typeFilter === 'Condo' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        Condo
                    </button>
                </div>
            </div>


            {/* user cards */}
            <div className="px-6 py-4 grid grid-cols-3 gap-4">
                {filtered.map(user => (
                    <div key={user.name} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mb-3">
                            {user.letter}
                        </div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.location}</p>
                        <p className="text-sm text-gray-500">Gender: {user.gender}</p>
                        <p className="text-sm text-gray-500">Type: {user.type}</p>
                        <p className="text-sm text-gray-500 mt-1">Budget: {user.budget}</p>
                    </div>
                ))}
            </div>

        </div>
    )
}
