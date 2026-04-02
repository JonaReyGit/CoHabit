import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'


function Dashboard() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // get the current user info to display their email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setEmail(session.user.email)
      }
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">

      <div className="bg-white rounded-lg shadow p-8 text-center">
        {/* <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Logged in as <span className="font-medium">{email}</span></p> */}
        

        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
          Sign Out
          </button>
        </header>

        <p className="text-gray-600 mb-6">Logged in as <span className="font-medium">{email}</span></p>




        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Root
          </button>

          <button
            onClick={() => navigate('/profilesetup')}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Dashboard
          </button>
        </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "John Doe", email: "john@example.com", status: "Active" },
              { name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
              { name: "Sam Wilson", email: "sam@example.com", status: "Active" },
            ].map((user, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${user.status === "Active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>




        
      </div>
    </div>
  )
}

export default Dashboard
