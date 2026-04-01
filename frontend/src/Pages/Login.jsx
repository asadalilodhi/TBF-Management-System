import { useState } from 'react';
import { GraduationCap, Building2, Users, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';

const MOCK_USERS = [
  { id: 'U001', username: 'admin',      password: 'admin123',   role: 'super_admin', name: 'Admin User',         campus: 'Both',         email: 'admin@bridgefoundation.org' },
  { id: 'U002', username: 'sana',       password: 'teacher123', role: 'teacher',     name: 'Ms. Sana Khan',      campus: 'North Campus', email: 'sana@bridgefoundation.org' },
  { id: 'U003', username: 'ahmed',      password: 'teacher123', role: 'teacher',     name: 'Mr. Ahmed Raza',     campus: 'South Campus', email: 'ahmed@bridgefoundation.org' },
  { id: 'U004', username: 'northadmin', password: 'admin123',   role: 'admin',       name: 'North Campus Admin', campus: 'North Campus', email: 'north.admin@bridgefoundation.org' },
  { id: 'U005', username: 'southadmin', password: 'admin123',   role: 'admin',       name: 'South Campus Admin', campus: 'South Campus', email: 'south.admin@bridgefoundation.org' },
];

const FEATURES = [
  {
    icon: Building2,
    title: 'Multi-Campus Management',
    description: 'Seamlessly manage North and South campuses from one unified platform with comprehensive oversight and control.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Secure access control for teachers, admins, and super admins with granular permissions for each role.',
  },
  {
    icon: ChevronRight,
    title: 'Comprehensive Features',
    description: 'Complete student management, daily attendance tracking, exam results entry, staff management, and detailed audit logging.',
  },
];

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('North Campus');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    await new Promise((r) => setTimeout(r, 500));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      onLogin(user, user.campus === 'Both' ? selectedCampus : user.campus);
    } else {
      setStatus('Invalid email or password.');
    }
    setLoading(false);
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

        {/* Footer link */}
        <div className="relative z-10">
          <a
            href="https://thebridgefoundation.com.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-red-100 hover:text-white text-sm transition-colors"
          >
            <ExternalLink className="size-4" />
            Visit TBF Official Website
            <ChevronRight className="size-4" />
          </a>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="size-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">The Bridge Foundation</p>
              <p className="text-gray-500 text-xs">School Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Campus selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Campus</label>
              <div className="grid grid-cols-2 gap-3">
                {['North Campus', 'South Campus'].map((campus) => (
                  <button
                    key={campus}
                    type="button"
                    onClick={() => setSelectedCampus(campus)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedCampus === campus
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="size-6" />
                    <span className="text-sm font-medium">{campus}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@bridgefoundation.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Demo credentials */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Demo Credentials:</p>
              <p><span className="font-medium">Super Admin:</span> admin@bridgefoundation.org • Both Campuses</p>
              <p><span className="font-medium">North Teacher:</span> sana@bridgefoundation.org • North Campus Only</p>
              <p><span className="font-medium">South Teacher:</span> ahmed@bridgefoundation.org • South Campus Only</p>
              <p className="text-gray-500 mt-1">Password: admin123 or teacher123</p>
            </div>

            {status && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {status}
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {/* Register button */}
            <button
              type="button"
              onClick={onRegister}
              className="w-full py-3.5 bg-white text-gray-800 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="size-4" />
              Register New Account
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;