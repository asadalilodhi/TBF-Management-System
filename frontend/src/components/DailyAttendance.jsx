import { useState, useEffect } from 'react';
import { Calendar, Save, RotateCcw, Edit2 } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { useUser } from './UserContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { useToast } from './ui/toast.jsx';

// ── Mock student data per class ──────────────────────────────────────────────
const mockClassStudents = {
  'Grade 1': [
    { studentId: '1', studentName: 'Ali Hassan', grNumber: 'GR009' },
    { studentId: '2', studentName: 'Hira Qamar', grNumber: 'GR010' },
    { studentId: '3', studentName: 'Sara Ahmed', grNumber: 'GR011' },
    { studentId: '4', studentName: 'Omar Farooq', grNumber: 'GR012' },
  ],
  'Grade 2': [
    { studentId: '5', studentName: 'Fatima Noor', grNumber: 'GR004' },
    { studentId: '6', studentName: 'Maryam Siddiqui', grNumber: 'GR008' },
    { studentId: '7', studentName: 'Bilal Khan', grNumber: 'GR013' },
    { studentId: '8', studentName: 'Aisha Ali', grNumber: 'GR014' },
  ],
  'Grade 3': [
    { studentId: '9', studentName: 'Hassan Ali', grNumber: 'GR003' },
    { studentId: '10', studentName: 'Ibrahim Qureshi', grNumber: 'GR007' },
    { studentId: '11', studentName: 'Zara Malik', grNumber: 'GR015' },
    { studentId: '12', studentName: 'Hamza Raza', grNumber: 'GR016' },
  ],
  'Grade 4': [
    { studentId: '13', studentName: 'Ayesha Malik', grNumber: 'GR002' },
    { studentId: '14', studentName: 'Zainab Hussain', grNumber: 'GR006' },
    { studentId: '15', studentName: 'Umar Shahid', grNumber: 'GR017' },
    { studentId: '16', studentName: 'Amna Hassan', grNumber: 'GR018' },
  ],
  'Grade 5': [
    { studentId: '17', studentName: 'Muhammad Ahmed Khan', grNumber: 'GR001' },
    { studentId: '18', studentName: 'Usman Farooq', grNumber: 'GR005' },
    { studentId: '19', studentName: 'Sana Iqbal', grNumber: 'GR019' },
    { studentId: '20', studentName: 'Faisal Ahmed', grNumber: 'GR020' },
  ],
};

// ── Seed: some pre-saved attendance ─────────────────────────────────────────
const mockSavedAttendance = [
  {
    date: '2026-02-27',
    class: 'Grade 1',
    campus: 'North Campus',
    records: [
      { studentId: '1', studentName: 'Ali Hassan', grNumber: 'GR009', status: 'Present' },
      { studentId: '2', studentName: 'Hira Qamar', grNumber: 'GR010', status: 'Present' },
      { studentId: '3', studentName: 'Sara Ahmed', grNumber: 'GR011', status: 'Absent' },
      { studentId: '4', studentName: 'Omar Farooq', grNumber: 'GR012', status: 'Present' },
    ],
  },
  {
    date: '2026-02-26',
    class: 'Grade 2',
    campus: 'North Campus',
    records: [
      { studentId: '5', studentName: 'Fatima Noor', grNumber: 'GR004', status: 'Present' },
      { studentId: '6', studentName: 'Maryam Siddiqui', grNumber: 'GR008', status: 'Leave' },
      { studentId: '7', studentName: 'Bilal Khan', grNumber: 'GR013', status: 'Present' },
      { studentId: '8', studentName: 'Aisha Ali', grNumber: 'GR014', status: 'Present' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export function DailyAttendance() {
  const { selectedCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const { currentUser } = useUser();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState('Grade 1');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [savedAttendance, setSavedAttendance] = useState(mockSavedAttendance);
  const [lastSavedRecords, setLastSavedRecords] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dialog states
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // ── Load attendance for a given date / class / campus ───────────────────
  const loadAttendance = (date, className, campus) => {
    const saved = savedAttendance.find(
      (s) => s.date === date && s.class === className && s.campus === campus
    );

    if (saved) {
      setAttendanceRecords(saved.records.map((r) => ({ ...r })));
      setLastSavedRecords(saved.records.map((r) => ({ ...r })));
    } else {
      const students = mockClassStudents[className];
      const newRecords = students.map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        grNumber: student.grNumber,
        status: null,
      }));
      setAttendanceRecords(newRecords);
      setLastSavedRecords(newRecords.map((r) => ({ ...r })));
    }
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    loadAttendance(selectedDate, selectedClass, selectedCampus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUnsavedChanges = (records) => {
    const hasChanges =
      JSON.stringify(records) !== JSON.stringify(lastSavedRecords);
    setHasUnsavedChanges(hasChanges);
  };

  // ── Date / class change guards ───────────────────────────────────────────
  const handleDateChange = (newDate) => {
    if (hasUnsavedChanges) {
      setPendingAction({ type: 'date', value: newDate });
      setShowUnsavedDialog(true);
    } else {
      setSelectedDate(newDate);
      loadAttendance(newDate, selectedClass, selectedCampus);
    }
  };

  const handleClassChange = (newClass) => {
    if (hasUnsavedChanges) {
      setPendingAction({ type: 'class', value: newClass });
      setShowUnsavedDialog(true);
    } else {
      setSelectedClass(newClass);
      loadAttendance(selectedDate, newClass, selectedCampus);
    }
  };

  const handleDiscardChanges = () => {
    if (pendingAction) {
      if (pendingAction.type === 'date') {
        setSelectedDate(pendingAction.value);
        loadAttendance(pendingAction.value, selectedClass, selectedCampus);
      } else {
        setSelectedClass(pendingAction.value);
        loadAttendance(selectedDate, pendingAction.value, selectedCampus);
      }
    }
    setShowUnsavedDialog(false);
    setPendingAction(null);
  };

  // ── Status change ────────────────────────────────────────────────────────
  const handleStatusChange = (studentId, status) => {
    const newRecords = attendanceRecords.map((record) =>
      record.studentId === studentId ? { ...record, status } : record
    );
    setAttendanceRecords(newRecords);
    checkUnsavedChanges(newRecords);
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAttendanceRecords(lastSavedRecords.map((r) => ({ ...r })));
    setHasUnsavedChanges(false);
    toast.info('Attendance Reset', { description: 'Reverted to last saved state' });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmitAttendance = () => {
    const unmarkedCount = attendanceRecords.filter((r) => r.status === null).length;

    if (unmarkedCount > 0) {
      toast.error('Incomplete Attendance', {
        description: `Please mark attendance for all students. ${unmarkedCount} student(s) remaining.`,
      });
      return;
    }

    const newSaved = savedAttendance.filter(
      (s) =>
        !(
          s.date === selectedDate &&
          s.class === selectedClass &&
          s.campus === selectedCampus
        )
    );
    newSaved.push({
      date: selectedDate,
      class: selectedClass,
      campus: selectedCampus,
      records: attendanceRecords.map((r) => ({ ...r })),
    });
    setSavedAttendance(newSaved);
    setLastSavedRecords(attendanceRecords.map((r) => ({ ...r })));
    setHasUnsavedChanges(false);

    addAuditLog({
      action: 'Attendance Marked',
      user: currentUser.name,
      details: `${selectedCampus} - ${selectedClass} - ${selectedDate}`,
    });

    toast.success('Attendance Submitted Successfully', {
      description: `Marked attendance for ${attendanceRecords.length} students`,
    });
  };

  // ── Individual edit ──────────────────────────────────────────────────────
  const handleOpenEditDialog = (student) => {
    const saved = savedAttendance.find(
      (s) =>
        s.date === selectedDate &&
        s.class === selectedClass &&
        s.campus === selectedCampus
    );

    if (!saved) {
      toast.error('Cannot Edit', {
        description: 'Please submit attendance first before individual edits',
      });
      return;
    }

    setEditingStudent(student);
    setShowEditDialog(true);
  };

  const handleSaveIndividualEdit = (newStatus) => {
    if (!editingStudent) return;

    const updatedSaved = savedAttendance.map((s) => {
      if (
        s.date === selectedDate &&
        s.class === selectedClass &&
        s.campus === selectedCampus
      ) {
        return {
          ...s,
          records: s.records.map((r) =>
            r.studentId === editingStudent.studentId
              ? { ...r, status: newStatus }
              : r
          ),
        };
      }
      return s;
    });

    setSavedAttendance(updatedSaved);

    const newRecords = attendanceRecords.map((r) =>
      r.studentId === editingStudent.studentId ? { ...r, status: newStatus } : r
    );
    setAttendanceRecords(newRecords);
    setLastSavedRecords(newRecords);

    toast.success('Attendance Updated', {
      description: `Updated ${editingStudent.studentName}'s attendance to ${newStatus}`,
    });

    setShowEditDialog(false);
    setEditingStudent(null);
  };

  // ── Derived counts ───────────────────────────────────────────────────────
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((r) => r.status === 'Leave').length;
  const totalStudents = attendanceRecords.length;
  const markedCount = presentCount + absentCount + leaveCount;

  const isSaved = savedAttendance.some(
    (s) =>
      s.date === selectedDate &&
      s.class === selectedClass &&
      s.campus === selectedCampus
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg text-black">Daily Attendance Marking</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mark attendance for {selectedCampus}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 lg:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Date Picker */}
            <div>
              <label className="block text-xs lg:text-sm text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Class Selector */}
            <div>
              <label className="block text-xs lg:text-sm text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
              >
                {Object.keys(mockClassStudents).map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div className="flex items-end">
              <div className="text-xs lg:text-sm">
                <p className="text-gray-700 mb-1">
                  Marked: {markedCount} / {totalStudents}
                </p>
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="text-green-600">P: {presentCount}</span>
                  <span className="text-red-600">A: {absentCount}</span>
                  <span className="text-yellow-600">L: {leaveCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-4 flex items-center gap-3">
            {isSaved && !hasUnsavedChanges && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✓ Attendance Saved
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                ⚠ Unsaved Changes
              </span>
            )}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm">
                    GR Number
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm">
                    Student Name
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs lg:text-sm">
                    Present
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs lg:text-sm">
                    Absent
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs lg:text-sm">
                    Leave
                  </th>
                  {isSaved && (
                    <th className="px-4 lg:px-6 py-3 text-center text-xs lg:text-sm">
                      Edit
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.studentId} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-black">
                      {record.grNumber}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-black">
                      {record.studentName}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.studentId}`}
                        checked={record.status === 'Present'}
                        onChange={() =>
                          handleStatusChange(record.studentId, 'Present')
                        }
                        className="size-4 lg:size-5 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.studentId}`}
                        checked={record.status === 'Absent'}
                        onChange={() =>
                          handleStatusChange(record.studentId, 'Absent')
                        }
                        className="size-4 lg:size-5 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.studentId}`}
                        checked={record.status === 'Leave'}
                        onChange={() =>
                          handleStatusChange(record.studentId, 'Leave')
                        }
                        className="size-4 lg:size-5 text-yellow-600 focus:ring-yellow-500"
                      />
                    </td>
                    {isSaved && (
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                        <button
                          onClick={() => handleOpenEditDialog(record)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Individual Attendance"
                        >
                          <Edit2 className="size-4 text-gray-700" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <button
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className={`flex items-center justify-center gap-2 px-4 lg:px-6 py-3 rounded-lg transition-colors text-sm ${
              hasUnsavedChanges
                ? 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="size-4" />
            Undo / Reset
          </button>

          <button
            onClick={handleSubmitAttendance}
            className="flex items-center justify-center gap-2 px-4 lg:px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
          >
            <Save className="size-4" />
            Submit Attendance
          </button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the current attendance. Do you want to
              discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Individual Attendance</DialogTitle>
            <DialogDescription>
              Update attendance for {editingStudent?.studentName} (
              {editingStudent?.grNumber})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {['Present', 'Absent', 'Leave'].map((s) => {
              const colors = {
                Present: 'border-green-600 hover:bg-green-50',
                Absent: 'border-red-600 hover:bg-red-50',
                Leave: 'border-yellow-500 hover:bg-yellow-50',
              };
              const checks = {
                Present: 'text-green-600',
                Absent: 'text-red-600',
                Leave: 'text-yellow-600',
              };
              return (
                <button
                  key={s}
                  onClick={() => handleSaveIndividualEdit(s)}
                  className={`w-full p-4 border-2 ${colors[s]} rounded-lg transition-colors text-left cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black">{s}</span>
                    {editingStudent?.status === s && (
                      <span className={checks[s]}>✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
