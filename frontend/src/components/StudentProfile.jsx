import { useState } from 'react';
import { ArrowLeft, User, BookOpen, Calendar } from 'lucide-react';

const mockBioData = {
  guardianCNIC: '42101-1234567-8',
  address: 'House #123, Street 45, Block A, Model Town, Lahore',
  contactNumber: '+92 300 1234567',
  emergencyContact: '+92 301 7654321',
  medicalInfo: 'No known allergies',
  bloodGroup: 'A+',
};

const mockAcademicHistory = [
  { term: 'Term 1 - 2025', totalMarks: 450, obtainedMarks: 382, percentage: 84.9, grade: 'A' },
  { term: 'Term 3 - 2024', totalMarks: 450, obtainedMarks: 368, percentage: 81.8, grade: 'A' },
  { term: 'Term 2 - 2024', totalMarks: 450, obtainedMarks: 375, percentage: 83.3, grade: 'A' },
  { term: 'Term 1 - 2024', totalMarks: 450, obtainedMarks: 360, percentage: 80.0, grade: 'A' },
];

const mockAttendance = [
  { date: '2026-01-31', status: 'Present' },
  { date: '2026-01-30', status: 'Present' },
  { date: '2026-01-29', status: 'Absent' },
  { date: '2026-01-28', status: 'Present' },
  { date: '2026-01-27', status: 'Present' },
  { date: '2026-01-24', status: 'Leave' },
  { date: '2026-01-23', status: 'Present' },
  { date: '2026-01-22', status: 'Present' },
  { date: '2026-01-21', status: 'Present' },
  { date: '2026-01-20', status: 'Present' },
];

const statusColors = {
  Present: 'bg-green-100 text-green-800',
  Absent: 'bg-red-100 text-red-800',
  Leave: 'bg-yellow-100 text-yellow-800',
};

const TABS = [
  { id: 'bio-data',   label: 'Bio-Data',         icon: User },
  { id: 'academic',   label: 'Academic History',  icon: BookOpen },
  { id: 'attendance', label: 'Attendance Log',    icon: Calendar },
];

export function StudentProfile({ student, onBack }) {
  const [activeTab, setActiveTab] = useState('bio-data');

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-black hover:text-red-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Student Directory
      </button>

      {/* Header card */}
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-lg">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="size-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="size-12 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl text-black">{student.name}</h2>
                <p className="text-sm text-gray-600 mt-1">GR Number: {student.grNumber}</p>
                <p className="text-sm text-gray-600">Current Class: {student.grade}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Campus</p>
                <p className="text-black">{student.campus}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Section</p>
                <p className="text-sm text-black">{student.section}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date of Birth</p>
                <p className="text-sm text-black">{student.dob || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className="text-sm text-black">{student.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Scholarship</p>
                {student.scholarship !== 'None' ? (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    {student.scholarship}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b-2 border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activeTab === id
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Bio-data */}
          {activeTab === 'bio-data' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Father/Guardian Name</label>
                <p className="text-black mt-1">{student.guardianName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Guardian CNIC</label>
                <p className="text-black mt-1">{mockBioData.guardianCNIC}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Address</label>
                <p className="text-black mt-1">{student.address || mockBioData.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Contact Number</label>
                <p className="text-black mt-1">{student.phone || mockBioData.contactNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Emergency Contact</label>
                <p className="text-black mt-1">{mockBioData.emergencyContact}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Blood Group</label>
                <p className="text-black mt-1">{mockBioData.bloodGroup}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Medical Information</label>
                <p className="text-black mt-1">{mockBioData.medicalInfo}</p>
              </div>
            </div>
          )}

          {/* Academic history */}
          {activeTab === 'academic' && (
            <div>
              <h4 className="text-lg text-black mb-4">Past Exam Results</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      {['Term Name', 'Total Marks', 'Obtained Marks', 'Percentage', 'Grade'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-sm text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockAcademicHistory.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-black">{r.term}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.totalMarks}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.obtainedMarks}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.percentage}%</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance log */}
          {activeTab === 'attendance' && (
            <div>
              <h4 className="text-lg text-black mb-4">Recent Attendance (Last 10 Days)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {mockAttendance.map((r) => (
                  <div key={r.date} className="border-2 border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600 mb-2">{r.date}</p>
                    <span className={`inline-block px-3 py-1 text-xs rounded ${statusColors[r.status] || 'bg-gray-100 text-gray-800'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="text-black">Attendance Rate:</span> 80% (8 out of 10 days present)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}