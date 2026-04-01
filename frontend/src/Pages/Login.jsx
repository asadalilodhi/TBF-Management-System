import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('North Campus');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      // 1. Send email, password, AND the selected dropdown campus to the strict backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        campus: selectedCampus // Sent to backend for strict validation!
      });

      // 2. Extract data (including the exact official DB campus name)
      const { token, user, assignedCampus } = response.data;
      
      localStorage.setItem('token', token);

      // 3. Pass the EXACT assigned campus to App.jsx to lock the Navbar!
      onLogin(user, assignedCampus);

    } catch (error) {
      setStatus(error.response?.data?.error || 'Server error. Is the backend running?');
    } finally {
      setLoading(false);
    }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="admin@bridgefoundation.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <option value="Central Campus">Central Campus</option>
              <option value="East Campus">East Campus</option>
            </select>
          </div>

          {status && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm font-medium text-center">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
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