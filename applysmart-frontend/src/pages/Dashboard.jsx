import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ApplySmart</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hello, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
            <p className="text-gray-600">
              Upload your resume for AI analysis
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Add Job Description</h3>
            <p className="text-gray-600">
              Paste a job description to get matched
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Track Applications</h3>
            <p className="text-gray-600">
              View and manage your applications
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="card bg-blue-50">
            <p className="text-gray-600 text-sm">Total Applications</p>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="card bg-green-50">
            <p className="text-gray-600 text-sm">Cover Letters</p>
            <p className="text-3xl font-bold text-success">0</p>
          </div>

          <div className="card bg-purple-50">
            <p className="text-gray-600 text-sm">Follow-ups</p>
            <p className="text-3xl font-bold text-secondary">0</p>
          </div>

          <div className="card bg-yellow-50">
            <p className="text-gray-600 text-sm">Match Score</p>
            <p className="text-3xl font-bold text-warning">0%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;