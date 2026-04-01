import { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { useRegistration } from './RegistrationContext.jsx';
import { useToast } from './ui/toast.jsx';

const ROLES = ['teacher', 'admin'];
const CAMPUSES = ['North Campus', 'South Campus'];

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your registration request has been sent to the Super Admin for approval.
            You will be notified once your account is approved.
          </p>
          <button
            onClick={onBackToLogin}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <UserPlus className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submit a request to the Super Admin for approval
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>

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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'teacher'
                ? 'Teachers can mark attendance and view performance screens.'
                : 'Admins can manage student records, exams, and staff.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
            <select
              value={formData.campus}
              onChange={(e) => handleChange('campus', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            >
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Registration Request'}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}