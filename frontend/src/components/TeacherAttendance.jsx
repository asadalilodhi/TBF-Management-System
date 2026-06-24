import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useUser } from './UserContext.jsx';
import { useToast } from './ui/toast.jsx';

export function TeacherAttendance() {
  const { currentUser } = useUser();
  const toast = useToast();

  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchTeacherAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch real data from the backend
        const response = await axios.get('http://localhost:5000/api/staff/teacher-attendance', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }));

        // 1. Generate all days in the current month (Excluding Sundays)
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = [];
        const numDays = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= numDays; i++) {
          const d = new Date(year, month, i);
          if (d.getDay() !== 0) { 
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            daysInMonth.push(dateStr);
          }
        }

        // 2. STRICT EMPTY FALLBACK: If DB is empty, use an empty array. No random data.
        const realDbData = Array.isArray(response.data) ? response.data : [];

        // 3. Map the days to the real database records
        const mappedData = daysInMonth.map(dateStr => {
          const dbRecord = realDbData.find(r => r.date === dateStr || r.attendance_date === dateStr);
          return {
            date: dateStr,
            status: dbRecord ? dbRecord.status.toLowerCase() : 'unmarked'
          };
        });

        // 4. Calculate the summary
        const newSummary = { present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 };
        mappedData.forEach(day => {
          if (newSummary[day.status] !== undefined) {
            newSummary[day.status]++;
          }
        });

        setAttendanceData(mappedData);
        setSummary(newSummary);
      } catch (error) {
        toast.error("Error", { description: "Failed to load attendance data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusIcons = {
    present: <CheckCircle2 className="size-5 text-green-600" />,
    absent: <XCircle className="size-5 text-red-600" />,
    late: <Clock className="size-5 text-orange-500" />,
    leave: <AlertCircle className="size-5 text-yellow-500" />,
    unmarked: <div className="size-5 rounded-full border-2 border-dashed border-gray-300" />
  };

  const statusColors = {
    present: 'bg-green-50 border-green-200',
    absent: 'bg-red-50 border-red-200',
    late: 'bg-orange-50 border-orange-200',
    leave: 'bg-yellow-50 border-yellow-200',
    unmarked: 'bg-gray-50 border-gray-200'
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading your attendance records...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl text-black font-bold">My Attendance</h3>
          <p className="text-sm text-gray-500 mt-1">{currentMonthName} • {currentUser?.name}</p>
        </div>
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
          Total Working Days: {attendanceData.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-3xl font-bold text-green-600">{summary.present}</span>
          <span className="text-sm text-gray-600 font-medium mt-1">Present</span>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-3xl font-bold text-orange-500">{summary.late}</span>
          <span className="text-sm text-gray-600 font-medium mt-1">Late</span>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-3xl font-bold text-red-600">{summary.absent}</span>
          <span className="text-sm text-gray-600 font-medium mt-1">Absent</span>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-3xl font-bold text-yellow-500">{summary.leave}</span>
          <span className="text-sm text-gray-600 font-medium mt-1">Leave</span>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
        <div className="bg-gray-50 p-4 border-b-2 border-gray-200 flex items-center gap-2">
            <CalendarDays className="size-5 text-gray-700" />
            <h4 className="font-semibold text-black">Daily Records</h4>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
          {attendanceData.map((day, idx) => (
            <div key={idx} className={`p-4 flex items-center justify-between ${statusColors[day.status] || statusColors.unmarked}`}>
              <span className="text-sm font-medium text-black">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {day.status}
                </span>
                {statusIcons[day.status] || statusIcons.unmarked}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}