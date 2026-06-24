import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Save, RotateCcw, Edit2, UserCheck } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { useUser } from './UserContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { useToast } from './ui/toast.jsx';

export function StaffAttendance() {
  const { selectedCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const { currentUser } = useUser();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [allStaff, setAllStaff] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [savedAttendance, setSavedAttendance] = useState([]); 
  const [lastSavedRecords, setLastSavedRecords] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // 1. Fetch Staff List
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        // We will build this backend route later, simulating data for now to match UI
        const response = await axios.get('http://localhost:5000/api/staff', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })); 

        // Fallback dummy data so you can test the UI immediately before we build the backend
        const liveStaff = response.data.length > 0 ? response.data : [
          { staffId: '1', staffName: 'Sabeen Fatima', role: 'Coordinator', campus: 'North Campus' },
          { staffId: '2', staffName: 'Syeda Mehak', role: 'Teacher', campus: 'North Campus' },
          { staffId: '3', staffName: 'Ms. Seema Batool', role: 'Teacher', campus: 'North Campus' },
          { staffId: '4', staffName: 'Ms. Heera Abid', role: 'Teacher', campus: 'South Campus' },
        ];

        const campusStaff = liveStaff.filter(s => selectedCampus === 'Both' || selectedCampus === 'All Campuses' || s.campus.includes(selectedCampus));
        setAllStaff(campusStaff);
      } catch (error) {
        toast.error('Data Error', { description: 'Could not load staff list.' });
      }
    };
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampus]);

  // 2. Load Attendance State
  useEffect(() => {
    if (allStaff.length > 0) loadAttendance(selectedDate, selectedCampus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCampus, allStaff]);

  const loadAttendance = (date, campus) => {
    const saved = savedAttendance.find((s) => s.date === date && s.campus === campus);
    if (saved) {
      setAttendanceRecords(saved.records.map((r) => ({ ...r })));
      setLastSavedRecords(saved.records.map((r) => ({ ...r })));
    } else {
      const newRecords = allStaff.map((staff) => ({
        staffId: staff.staffId, staffName: staff.staffName, role: staff.role, status: null,
      }));
      setAttendanceRecords(newRecords);
      setLastSavedRecords(newRecords.map((r) => ({ ...r })));
    }
    setHasUnsavedChanges(false);
  };

  const checkUnsavedChanges = (records) => setHasUnsavedChanges(JSON.stringify(records) !== JSON.stringify(lastSavedRecords));

  const handleDateChange = (newDate) => {
    if (hasUnsavedChanges) { setPendingDate(newDate); setShowUnsavedDialog(true); } 
    else setSelectedDate(newDate);
  };

  const handleStatusChange = (staffId, status) => {
    const newRecords = attendanceRecords.map((record) => record.staffId === staffId ? { ...record, status } : record);
    setAttendanceRecords(newRecords);
    checkUnsavedChanges(newRecords);
  };

  // THE BOTTLENECK KILLER
  const handleMarkRemainingPresent = () => {
    const newRecords = attendanceRecords.map((record) => record.status === null ? { ...record, status: 'Present' } : record);
    setAttendanceRecords(newRecords);
    checkUnsavedChanges(newRecords);
    toast.info('Auto-Filled', { description: 'All unmarked staff have been marked Present.' });
  };

  const handleReset = () => {
    setAttendanceRecords(lastSavedRecords.map((r) => ({ ...r })));
    setHasUnsavedChanges(false);
    toast.info('Attendance Reset', { description: 'Reverted to last saved state' });
  };

  const handleSubmitAttendance = () => {
    const unmarkedCount = attendanceRecords.filter((r) => r.status === null).length;
    if (unmarkedCount > 0) {
      toast.error('Incomplete Attendance', { description: `Please mark attendance for all staff. ${unmarkedCount} remaining.` });
      return;
    }
    const newSaved = savedAttendance.filter((s) => !(s.date === selectedDate && s.campus === selectedCampus));
    newSaved.push({ date: selectedDate, campus: selectedCampus, records: attendanceRecords.map((r) => ({ ...r })) });
    
    setSavedAttendance(newSaved); setLastSavedRecords(attendanceRecords.map((r) => ({ ...r }))); setHasUnsavedChanges(false);
    addAuditLog({ action: 'Staff Attendance Marked', user: currentUser.name, details: `${selectedCampus} - ${selectedDate}` });
    toast.success('Save Successful', { description: `Marked attendance for ${attendanceRecords.length} staff members.` });
  };

  const handleOpenEditDialog = (staff) => {
    const saved = savedAttendance.find((s) => s.date === selectedDate && s.campus === selectedCampus);
    if (!saved) { toast.error('Cannot Edit', { description: 'Please submit attendance first before individual edits' }); return; }
    setEditingStaff(staff); setShowEditDialog(true);
  };

  const handleSaveIndividualEdit = (newStatus) => {
    if (!editingStaff) return;
    const updatedSaved = savedAttendance.map((s) => {
      if (s.date === selectedDate && s.campus === selectedCampus) {
        return { ...s, records: s.records.map((r) => r.staffId === editingStaff.staffId ? { ...r, status: newStatus } : r) };
      }
      return s;
    });
    setSavedAttendance(updatedSaved);
    const newRecords = attendanceRecords.map((r) => r.staffId === editingStaff.staffId ? { ...r, status: newStatus } : r);
    setAttendanceRecords(newRecords); setLastSavedRecords(newRecords);
    toast.success('Attendance Updated', { description: `Updated ${editingStaff.staffName}'s attendance to ${newStatus}` });
    setShowEditDialog(false); setEditingStaff(null);
  };

  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((r) => r.status === 'Leave').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'Late').length;
  const totalStaff = attendanceRecords.length;
  const markedCount = presentCount + absentCount + leaveCount + lateCount;
  const isSaved = savedAttendance.some((s) => s.date === selectedDate && s.campus === selectedCampus);

  return (
    <>
      <div className="space-y-6">
        <div><h3 className="text-lg text-black">Staff Attendance Management</h3><p className="text-sm text-gray-500 mt-1">Manage daily check-ins for {selectedCampus}</p></div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <label className="block text-xs lg:text-sm text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm" />
                </div>
              </div>
            </div>

            <div className="flex items-end w-full sm:w-auto">
              <div className="text-xs lg:text-sm w-full">
                <p className="text-gray-700 mb-1 font-medium">Marked: {markedCount} / {totalStaff}</p>
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200 w-full justify-between sm:w-[300px]">
                  <span className="text-green-700 font-semibold">P: {presentCount}</span>
                  <span className="text-red-700 font-semibold">A: {absentCount}</span>
                  <span className="text-yellow-600 font-semibold">L: {leaveCount}</span>
                  <span className="text-orange-600 font-semibold">Late: {lateCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {isSaved && !hasUnsavedChanges && <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓ Attendance Saved</span>}
            {hasUnsavedChanges && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">⚠ Unsaved Changes</span>}
          </div>
        </div>

        {/* BATCH ACTION BAR */}
        <div className="flex justify-end">
             <button onClick={handleMarkRemainingPresent} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm cursor-pointer shadow-sm">
                <UserCheck className="size-4" /> Mark All Remaining as Present
             </button>
        </div>

        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs lg:text-sm">Staff Name</th>
                  <th className="px-4 py-3 text-left text-xs lg:text-sm">Role</th>
                  <th className="px-2 py-3 text-center text-xs lg:text-sm">Present</th>
                  <th className="px-2 py-3 text-center text-xs lg:text-sm">Absent</th>
                  <th className="px-2 py-3 text-center text-xs lg:text-sm">Leave</th>
                  <th className="px-2 py-3 text-center text-xs lg:text-sm">Late</th>
                  {isSaved && <th className="px-4 py-3 text-center text-xs lg:text-sm">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {attendanceRecords.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm font-medium">No staff found for this campus.</td></tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record.staffId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs lg:text-sm text-black font-medium">{record.staffName}</td>
                      <td className="px-4 py-3 text-xs lg:text-sm text-gray-600">{record.role}</td>
                      <td className="px-2 py-3 text-center"><input type="radio" name={`attendance-${record.staffId}`} checked={record.status === 'Present'} onChange={() => handleStatusChange(record.staffId, 'Present')} className="size-4 lg:size-5 text-green-600 cursor-pointer" /></td>
                      <td className="px-2 py-3 text-center"><input type="radio" name={`attendance-${record.staffId}`} checked={record.status === 'Absent'} onChange={() => handleStatusChange(record.staffId, 'Absent')} className="size-4 lg:size-5 text-red-600 cursor-pointer" /></td>
                      <td className="px-2 py-3 text-center"><input type="radio" name={`attendance-${record.staffId}`} checked={record.status === 'Leave'} onChange={() => handleStatusChange(record.staffId, 'Leave')} className="size-4 lg:size-5 text-yellow-500 cursor-pointer" /></td>
                      <td className="px-2 py-3 text-center"><input type="radio" name={`attendance-${record.staffId}`} checked={record.status === 'Late'} onChange={() => handleStatusChange(record.staffId, 'Late')} className="size-4 lg:size-5 text-orange-500 cursor-pointer" /></td>
                      {isSaved && (<td className="px-4 py-3 text-center"><button onClick={() => handleOpenEditDialog(record)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><Edit2 className="size-4 text-gray-700" /></button></td>)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <button onClick={handleReset} disabled={!hasUnsavedChanges} className={`flex items-center justify-center gap-2 px-4 lg:px-6 py-3 rounded-lg transition-colors text-sm ${hasUnsavedChanges ? 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><RotateCcw className="size-4" /> Undo / Reset</button>
          <button onClick={handleSubmitAttendance} className="flex items-center justify-center gap-2 px-4 lg:px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"><Save className="size-4" /> Submit Attendance</button>
        </div>
      </div>

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent><DialogHeader><DialogTitle>Unsaved Changes</DialogTitle><DialogDescription>You have unsaved changes. Discard them?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => { setShowUnsavedDialog(false); setPendingDate(null); }}>Cancel</Button><Button onClick={() => { setSelectedDate(pendingDate); setShowUnsavedDialog(false); setPendingDate(null); }} className="bg-red-600 hover:bg-red-700 text-white">Discard Changes</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Staff Attendance</DialogTitle><DialogDescription>Update attendance for {editingStaff?.staffName}</DialogDescription></DialogHeader>
          <div className="space-y-3 py-4">
            {['Present', 'Absent', 'Leave', 'Late'].map((s) => {
              const colors = { Present: 'border-green-600 hover:bg-green-50', Absent: 'border-red-600 hover:bg-red-50', Leave: 'border-yellow-500 hover:bg-yellow-50', Late: 'border-orange-500 hover:bg-orange-50' };
              const checks = { Present: 'text-green-600', Absent: 'text-red-600', Leave: 'text-yellow-600', Late: 'text-orange-600' };
              return ( <button key={s} onClick={() => handleSaveIndividualEdit(s)} className={`w-full p-4 border-2 ${colors[s]} rounded-lg transition-colors text-left cursor-pointer`}><div className="flex items-center justify-between"><span className="font-semibold text-black">{s}</span>{editingStaff?.status === s && <span className={checks[s]}>✓</span>}</div></button> );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}