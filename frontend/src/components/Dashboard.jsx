import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, BookOpen, GraduationCap, CalendarClock, UserCheck } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { useToast } from './ui/toast.jsx';

export function Dashboard({ onNavigateToStudents, onNavigateToAttendance, onNavigateToSyllabus }) {
  const { selectedCampus, setSelectedCampus, campuses } = useCampus();
  const { auditLogs } = useAuditLog();
  const toast = useToast();

  const [timeFilter, setTimeFilter] = useState('Today'); // 'Today' or 'Month'
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── 1. MODULAR DATA FETCH ───────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }));

        // FALLBACK: If backend isn't ready yet, use this mock data so the UI doesn't break!
        const liveData = Array.isArray(response.data) ? response.data : [];

        setDashboardData(liveData);
      } catch (error) {
        toast.error('Dashboard Error', { description: 'Could not load live statistics.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. DYNAMIC CALCULATIONS ─────────────────────────────────────────────
  let currentStats;

  if (Array.isArray(dashboardData) && dashboardData.length > 0) {
    // Find the specific campus data
    currentStats = dashboardData.find(d => d.name === selectedCampus);
  }

  // STRICT ZERO-STATE FALLBACK: If DB is empty, or campus has no data yet, show 0s.
  if (!currentStats) {
    currentStats = {
      name: selectedCampus || 'No Campus',
      totalStudents: 0,
      grades: [], 
      metrics: {
        Today: { studentAttendance: 0, staffAttendance: 0, syllabusCompletion: 0 },
        Month: { studentAttendance: 0, staffAttendance: 0, syllabusCompletion: 0 }
      }
    };
  }

  // ── 3. RENDER ─────────────────────────────────────────────────────────
  if (isLoading || !currentStats) {
    return <div className="p-12 text-center text-gray-500">Loading Dashboard Analytics...</div>;
  }

  const stats = [
    { label: 'Total Students', value: currentStats.totalStudents.toString(), icon: Users, color: 'bg-red-600', onClick: () => onNavigateToStudents(null) },
    { label: `Student Attendance`, value: `${currentStats.metrics[timeFilter].studentAttendance}%`, icon: TrendingUp, color: 'bg-black', onClick: onNavigateToAttendance },
    { label: `Staff Attendance`, value: `${currentStats.metrics[timeFilter].staffAttendance}%`, icon: UserCheck, color: 'bg-orange-500', onClick: () => {} },
    { label: 'Syllabus Completion', value: `${currentStats.metrics[timeFilter].syllabusCompletion}%`, icon: BookOpen, color: 'bg-red-600', onClick: onNavigateToSyllabus },
  ];

  // Dynamic mapped data for the bottom comparison widget
  // NEW: Map over the actual 'campuses' list so it always renders, even with 0 data
  const comparisonData = campuses.map(campusObj => {
    // Try to find real data if the backend provided it
    const stats = dashboardData.find(d => d.name === campusObj.name);
    
    if (stats && stats.metrics) {
      return {
        name: campusObj.name,
        studentAttendance: stats.metrics[timeFilter]?.studentAttendance || 0,
        staffAttendance: stats.metrics[timeFilter]?.staffAttendance || 0,
        syllabusCompletion: stats.metrics[timeFilter]?.syllabusCompletion || 0,
        students: stats.totalStudents || 0,
      };
    }
    
    // STRICT ZERO-STATE: If no data exists for this campus yet, render the 0% metrics
    return {
      name: campusObj.name,
      studentAttendance: 0,
      staffAttendance: 0,
      syllabusCompletion: 0,
      students: 0,
    };
  });

  const handleComparisonNavigate = (targetCampus, navCallback, payload = null) => {
    if (selectedCampus !== targetCampus) setSelectedCampus(targetCampus);
    navCallback(payload);
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg text-black">Quick Stats - {selectedCampus}</h3>
          
          <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg p-1 shadow-sm">
            <CalendarClock className="size-4 text-gray-500 ml-2" />
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer pr-4 outline-none">
              <option value="Today">Today's Snapshot</option>
              <option value="Month">Month-to-Date Average</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} onClick={stat.onClick} className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm cursor-pointer hover:border-red-600 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl text-black">{stat.value}</p>
                    <p className={`text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${stat.onClick ? 'text-red-600' : 'text-transparent'}`}>Click to view →</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}><Icon className="size-6 text-white" /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Breakdown */}
      <div>
        <h3 className="text-lg text-black mb-4">Grade Breakdown - {selectedCampus}</h3>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {currentStats.grades.map((grade, index) => (
              <div key={grade.name} onClick={() => onNavigateToStudents(grade.name)} className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-600 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center mb-2">
                  <div className={`size-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-red-600' : 'bg-black'}`}><GraduationCap className="size-5 text-white" /></div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{grade.name}</p>
                <p className="text-2xl text-black font-semibold">{grade.students}</p>
                <p className="text-xs text-gray-500 mt-1">students</p>
                <p className="text-xs text-red-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View {grade.name} →</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Comparison Widget (DYNAMIC MAPPING) */}
      <div>
        <h3 className="text-lg text-black mb-4">Campus Comparison</h3>
        <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
          <div className={`grid grid-cols-1 lg:grid-cols-${comparisonData.length} divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-gray-200`}>
            {comparisonData.map((campus, index) => (
              <div key={campus.name} className="p-6">
                <h4 className="text-xl text-black mb-6">{campus.name}</h4>

                <div className="space-y-6">
                  {/* Students Count */}
                  <div onClick={() => handleComparisonNavigate(campus.name, onNavigateToStudents)} className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-700">Total Students</span><div className="flex items-center gap-2"><span className="text-lg text-black">{campus.students}</span><span className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">View →</span></div></div>
                  </div>

                  {/* Student Attendance */}
                  <div onClick={() => handleComparisonNavigate(campus.name, onNavigateToAttendance)} className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-700">Student Attendance</span><div className="flex items-center gap-2"><span className="text-lg text-black">{campus.studentAttendance}%</span><span className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">View →</span></div></div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${index % 2 === 0 ? 'bg-red-600' : 'bg-black'}`} style={{ width: `${campus.studentAttendance}%` }}></div></div>
                  </div>

                  {/* Staff Attendance */}
                  <div className="hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-700">Staff Attendance</span><div className="flex items-center gap-2"><span className="text-lg text-black">{campus.staffAttendance}%</span></div></div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full bg-orange-500`} style={{ width: `${campus.staffAttendance}%` }}></div></div>
                  </div>

                  {/* Syllabus Completion */}
                  <div onClick={() => handleComparisonNavigate(campus.name, onNavigateToSyllabus)} className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-700">Syllabus Completion</span><div className="flex items-center gap-2"><span className="text-lg text-black">{campus.syllabusCompletion}%</span><span className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">View →</span></div></div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${index % 2 === 0 ? 'bg-red-600' : 'bg-black'}`} style={{ width: `${campus.syllabusCompletion}%` }}></div></div>
                  </div>

                  {/* Performance Circle */}
                  <div className="pt-4">
                    <div className="flex items-center justify-center">
                      <div className="relative size-32">
                        <svg className="size-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <circle cx="64" cy="64" r="56" stroke={index % 2 === 0 ? '#D32F2F' : '#000000'} strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - (campus.studentAttendance + campus.staffAttendance + campus.syllabusCompletion) / 300)}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl text-black font-semibold">{((campus.studentAttendance + campus.staffAttendance + campus.syllabusCompletion) / 3).toFixed(1)}%</span></div>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-2">Overall Performance Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg text-black mb-4">Recent Activity</h3>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log, index) => (
              <div key={log.id} className={`flex items-start gap-3 ${index !== auditLogs.slice(0, 5).length - 1 ? 'pb-3 border-b border-gray-200' : ''}`}>
                <div className={`size-2 rounded-full mt-2 ${index === 0 ? 'bg-red-600' : index === 1 ? 'bg-black' : 'bg-gray-400'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-black">{log.user} - {log.action}</p>
                  <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}