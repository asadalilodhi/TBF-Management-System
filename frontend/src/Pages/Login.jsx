import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin, onRegister }) {
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
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-700 rounded-full translate-y-1/2 -translate-x-1/4 opacity-50" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">The Bridge Foundation</h1>
              <p className="text-red-200 text-sm">School Management System</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-red-100 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">

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

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;