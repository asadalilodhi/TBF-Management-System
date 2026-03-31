import { useState } from 'react';

const MOCK_USERS = [
  { id: 'U001', username: 'admin',      password: 'admin123',    role: 'super_admin', name: 'Admin User',          campus: 'Both',         email: 'admin@bridgefoundation.org' },
  { id: 'U002', username: 'sana',       password: 'teacher123',  role: 'teacher',     name: 'Ms. Sana Khan',       campus: 'North Campus', email: 'sana@bridgefoundation.org' },
  { id: 'U003', username: 'ahmed',      password: 'teacher123',  role: 'teacher',     name: 'Mr. Ahmed Raza',      campus: 'South Campus', email: 'ahmed@bridgefoundation.org' },
  { id: 'U004', username: 'northadmin', password: 'admin123',    role: 'admin',       name: 'North Campus Admin',  campus: 'North Campus', email: 'north.admin@bridgefoundation.org' },
  { id: 'U005', username: 'southadmin', password: 'admin123',    role: 'admin',       name: 'South Campus Admin',  campus: 'South Campus', email: 'south.admin@bridgefoundation.org' },
];

function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('North Campus');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    await new Promise(r => setTimeout(r, 500));

    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user, user.campus === 'Both' ? selectedCampus : user.campus);
    } else {
      setStatus('Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">TBF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TBF Staff Portal</h1>
          <p className="text-gray-500 text-sm mt-1">The Bridge Foundation Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            >
              <option value="North Campus">North Campus</option>
              <option value="South Campus">South Campus</option>
            </select>
          </div>

          {status && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Secure Login'}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">Don't have an account? </span>
          <button
            onClick={onRegister}
            className="text-sm text-red-600 font-semibold hover:text-red-700 transition-colors"
          >
            Request Access
          </button>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-2">Demo Credentials:</p>
          <p>Super Admin: <span className="font-mono">admin / admin123</span></p>
          <p>Teacher: <span className="font-mono">sana / teacher123</span></p>
          <p>Admin: <span className="font-mono">northadmin / admin123</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;