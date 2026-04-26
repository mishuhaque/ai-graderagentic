import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Grader</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome, {user?.full_name || user?.email}!
            </h2>
            <p className="text-gray-600 mb-4">
              This is your AI Grader dashboard. Features coming soon:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Create and manage classes</li>
              <li>Create assignments with custom rubrics</li>
              <li>Upload and grade student submissions</li>
              <li>Generate detailed grading reports</li>
              <li>Download results as Excel/CSV</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
