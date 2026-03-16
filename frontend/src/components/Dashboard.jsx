import { Users, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';

export function Dashboard({ onNavigateToStudents }) {
  const { selectedCampus } = useCampus();
  const { auditLogs } = useAuditLog();

  const campusGradeData = {
    'North Campus': {
      grades: [
        { name: 'Grade 1', students: 52 },
        { name: 'Grade 2', students: 48 },
        { name: 'Grade 3', students: 55 },
        { name: 'Grade 4', students: 62 },
        { name: 'Grade 5', students: 70 },
      ],
      totalStudents: 287,
      todayAttendance: 96.2,
      syllabusCompletion: 72.5,
    },
    'South Campus': {
      grades: [
        { name: 'Grade 1', students: 42 },
        { name: 'Grade 2', students: 45 },
        { name: 'Grade 3', students: 50 },
        { name: 'Grade 4', students: 48 },
        { name: 'Grade 5', students: 52 },
      ],
      totalStudents: 237,
      todayAttendance: 92.8,
      syllabusCompletion: 63.1,
    },
  };

  const currentStats = campusGradeData[selectedCampus];

  const stats = [
    { label: 'Total Students', value: currentStats.totalStudents.toString(), icon: Users, color: 'bg-red-600', clickable: true },
    { label: "Today's Attendance", value: `${currentStats.todayAttendance}%`, icon: TrendingUp, color: 'bg-black', clickable: false },
    { label: 'Syllabus Completion', value: `${currentStats.syllabusCompletion}%`, icon: BookOpen, color: 'bg-red-600', clickable: false },
  ];

  const campusData = [
    {
      name: 'North Campus',
      attendance: 96.2,
      syllabusCompletion: 72.5,
      students: 287,
    },
    {
      name: 'South Campus',
      attendance: 92.8,
      syllabusCompletion: 63.1,
      students: 237,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div>
        <h3 className="text-lg text-black mb-4">Quick Stats - {selectedCampus}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm ${stat.clickable ? 'cursor-pointer hover:border-red-600 hover:shadow-md transition-all' : ''}`}
                onClick={stat.clickable && onNavigateToStudents ? onNavigateToStudents : undefined}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl text-black">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="size-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Breakdown for Current Campus */}
      <div>
        <h3 className="text-lg text-black mb-4">Grade Breakdown - {selectedCampus}</h3>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {currentStats.grades.map((grade, index) => (
              <div
                key={grade.name}
                className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-600 transition-colors"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className={`size-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-red-600' : 'bg-black'}`}>
                    <GraduationCap className="size-5 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{grade.name}</p>
                <p className="text-2xl text-black font-semibold">{grade.students}</p>
                <p className="text-xs text-gray-500 mt-1">students</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Comparison Widget */}
      <div>
        <h3 className="text-lg text-black mb-4">Campus Comparison</h3>
        <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-gray-200">
            {campusData.map((campus, index) => (
              <div key={campus.name} className="p-6">
                <h4 className="text-xl text-black mb-6">{campus.name}</h4>

                <div className="space-y-6">
                  {/* Students Count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Total Students</span>
                      <span className="text-lg text-black">{campus.students}</span>
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Attendance Rate</span>
                      <span className="text-lg text-black">{campus.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${index === 0 ? 'bg-red-600' : 'bg-black'}`}
                        style={{ width: `${campus.attendance}%` }}
                      ></div>
                    </div>
                    {campus.attendance > campusData[1 - index].attendance && (
                      <p className="text-xs text-green-600 mt-1">Leading by {(campus.attendance - campusData[1 - index].attendance).toFixed(1)}%</p>
                    )}
                  </div>

                  {/* Syllabus Completion */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Syllabus Completion</span>
                      <span className="text-lg text-black">{campus.syllabusCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${index === 0 ? 'bg-red-600' : 'bg-black'}`}
                        style={{ width: `${campus.syllabusCompletion}%` }}
                      ></div>
                    </div>
                    {campus.syllabusCompletion > campusData[1 - index].syllabusCompletion && (
                      <p className="text-xs text-green-600 mt-1">Leading by {(campus.syllabusCompletion - campusData[1 - index].syllabusCompletion).toFixed(1)}%</p>
                    )}
                  </div>

                  {/* Performance Circle */}
                  <div className="pt-4">
                    <div className="flex items-center justify-center">
                      <div className="relative size-32">
                        <svg className="size-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={index === 0 ? '#D32F2F' : '#000000'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - (campus.attendance + campus.syllabusCompletion) / 200)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl text-black">
                            {((campus.attendance + campus.syllabusCompletion) / 2).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-2">Overall Performance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity from Audit Logs */}
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
                  <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
