import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, User, BookOpen, Calendar } from 'lucide-react';

export function StudentProfile({ student, onBack }) {
  const [activeTab, setActiveTab] = useState('bio');
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch the full profile, academics, and attendance for this specific student
        const res = await axios.get(`http://localhost:5000/api/students/${student.studentId}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }));

        // Fallback mock data so the UI doesn't break before the backend is finished
        const liveData = res.data || {
          bio: {
            guardianCNIC: '42101-1234567-8',
            address: 'House #123, Street 45, Block A, Model Town',
            contactNumber: student.phone || '+92 300 1234567',
            emergencyContact: '+92 301 7654321',
            medicalInfo: 'No known allergies',
            bloodGroup: 'A+',
            fatherName: 'Muhammad Ali',
            motherName: 'Fatima Ali'
          },
          academic: [
            { term: 'Term 1 - 2025', totalMarks: 450, obtainedMarks: 382, percentage: 84.9, grade: 'A' },
            { term: 'Term 3 - 2024', totalMarks: 450, obtainedMarks: 368, percentage: 81.8, grade: 'A' }
          ],
          attendance: [
            { date: '2026-01-31', status: 'Present' },
            { date: '2026-01-30', status: 'Present' },
            { date: '2026-01-29', status: 'Absent' },
          ],
          attendanceStats: { rate: '80%', summary: '8 out of 10 days present' }
        };

        setProfileData(liveData);
      } catch (error) {
        console.error("Failed to load student profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (student?.studentId) {
      fetchStudentDetails();
    }
  }, [student]);

  if (isLoading || !profileData) {
    return <div className="p-12 text-center text-gray-500">Loading student profile...</div>;
  }

  const statusColors = { Present: 'bg-green-100 text-green-800', Absent: 'bg-red-100 text-red-800', Leave: 'bg-yellow-100 text-yellow-800', Late: 'bg-orange-100 text-orange-800' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft className="size-5 text-gray-600" />
        </button>
        <div>
          <h3 className="text-xl text-black font-bold">{student.studentName}</h3>
          <p className="text-sm text-gray-500">GR: {student.grNumber} • {student.className} • {student.campus}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b-2 border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'bio', icon: User, label: 'Bio & Contact' },
          { id: 'academic', icon: BookOpen, label: 'Academic History' },
          { id: 'attendance', icon: Calendar, label: 'Attendance Log' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="size-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
        {activeTab === 'bio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><p className="text-sm text-gray-500">Father's Name</p><p className="text-black font-medium">{profileData.bio.fatherName}</p></div>
            <div><p className="text-sm text-gray-500">Mother's Name</p><p className="text-black font-medium">{profileData.bio.motherName}</p></div>
            <div><p className="text-sm text-gray-500">Primary Contact</p><p className="text-black font-medium">{profileData.bio.contactNumber}</p></div>
            <div><p className="text-sm text-gray-500">Emergency Contact</p><p className="text-black font-medium">{profileData.bio.emergencyContact}</p></div>
            <div><p className="text-sm text-gray-500">Guardian CNIC</p><p className="text-black font-medium">{profileData.bio.guardianCNIC}</p></div>
            <div><p className="text-sm text-gray-500">Blood Group</p><p className="text-black font-medium">{profileData.bio.bloodGroup}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">Address</p><p className="text-black font-medium">{profileData.bio.address}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">Medical Information</p><p className="text-black font-medium">{profileData.bio.medicalInfo}</p></div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-3 text-sm text-gray-600">Term</th><th className="px-4 py-3 text-sm text-gray-600">Total Marks</th><th className="px-4 py-3 text-sm text-gray-600">Obtained</th><th className="px-4 py-3 text-sm text-gray-600">Percentage</th><th className="px-4 py-3 text-sm text-gray-600">Grade</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profileData.academic.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm text-black font-medium">{r.term}</td><td className="px-4 py-3 text-sm text-gray-700">{r.totalMarks}</td><td className="px-4 py-3 text-sm text-gray-700">{r.obtainedMarks}</td><td className="px-4 py-3 text-sm text-gray-700">{r.percentage}%</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">{r.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h4 className="text-lg text-black mb-4">Recent Attendance</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {profileData.attendance.map((r, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-600 mb-2">{r.date}</p>
                  <span className={`inline-block px-3 py-1 text-xs rounded ${statusColors[r.status] || 'bg-gray-100 text-gray-800'}`}>{r.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
              <span className="text-black font-medium">Attendance Rate:</span> {profileData.attendanceStats.rate} ({profileData.attendanceStats.summary})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}