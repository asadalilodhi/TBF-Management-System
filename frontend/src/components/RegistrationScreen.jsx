import { useState } from 'react';
import { GraduationCap, UserPlus, CheckCircle, Building2, ChevronRight, ExternalLink } from 'lucide-react';
import { useRegistration } from './RegistrationContext.jsx';
import { useToast } from './ui/toast.jsx';

const ROLES = ['teacher', 'admin'];
const CAMPUSES = ['North Campus', 'South Campus'];

const SIDE_ITEMS = [
  {
    icon: UserPlus,
    title: 'Request Staff Access',
    description: 'Submit a registration request that will be reviewed and approved by a Super Admin.',
  },
  {
    icon: Building2,
    title: 'Campus Assignment',
    description: 'Select your campus during registration so you are placed in the right environment from day one.',
  },
  {
    icon: ChevronRight,
    title: 'Role-Based Onboarding',
    description: 'Whether you are a teacher or admin, your permissions will be set up correctly upon approval.',
  },
];

export function RegistrationScreen({ onBackToLogin }) {
  const { addRegistrationRequest } = useRegistration();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    campus: 'North Campus',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Missing Fields', { description: 'Please fill in all required fields.' });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addRegistrationRequest(formData);
    toast.success('Request Submitted', {
      description: 'A Super Admin will review and approve your account.',
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-700 rounded-full translate-y-1/2 -translate-x-1/4 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold leading-tight">The Bridge Foundation</h1>
                <p className="text-red-200 text-sm">School Management System</p>
              </div>
            </div>
            <div className="space-y-8">
              {SIDE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-red-100 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

        {/* Right panel — success state */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Request Submitted!</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Your registration request has been sent to the Super Admin for approval.
              You will be notified once your account is approved.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-700 rounded-full translate-y-1/2 -translate-x-1/4 opacity-50" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">The Bridge Foundation</h1>
              <p className="text-red-200 text-sm">School Management System</p>
            </div>
          </div>

          <div className="space-y-8">
            {SIDE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-red-100 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Register New Account</h2>
          <p className="text-gray-500 text-sm mb-8">Submit a request to the Super Admin for approval</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Campus selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Campus</label>
              <div className="grid grid-cols-2 gap-3">
                {CAMPUSES.map((campus) => (
                  <button
                    key={campus}
                    type="button"
                    onClick={() => handleChange('campus', campus)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.campus === campus
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

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                placeholder="you@bridgefoundation.org"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleChange('role', r)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.role === r
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.role === 'teacher'
                  ? 'Teachers can mark attendance and view performance screens.'
                  : 'Admins can manage student records, exams, and staff.'}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus className="size-4" />
              {loading ? 'Submitting...' : 'Submit Registration Request'}
            </button>

            {/* Back to login */}
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              ← Back to Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}