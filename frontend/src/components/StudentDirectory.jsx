import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, User } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { useUser } from './UserContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { useToast } from './ui/toast.jsx';

// NEW: Updated to perfectly match the 01_schema.sql update and CSV Master file
const emptyForm = {
  fullName: '', 
  admissionNumber: '', 
  dateOfBirth: '', 
  gender: 'Male',
  campus: '', // Will be set dynamically
  classSelection: '', 
  phone: '',
  fatherName: '', 
  motherName: '', 
  address: '',
  
  // Admission Pipeline Fields
  previousSchool: '',
  testResult: '',
  interviewStatus: '',
  admissionStatus: 'Confirmed',
  admissionDate: new Date().toISOString().split('T')[0],
  status: 'Active'
};

export function StudentDirectory({ initialGradeFilter }) {
  // NEW: We now extract 'campuses' to dynamically build the dropdowns
  const { selectedCampus, campuses } = useCampus();
  const { addAuditLog } = useAuditLog();
  const { currentUser } = useUser();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState(initialGradeFilter || 'All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // New State for Transfer Feature
  const [selectedIds, setSelectedIds] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDestination, setTransferDestination] = useState('');

  useEffect(() => {
    if (initialGradeFilter) setFilterClass(initialGradeFilter);
    else setFilterClass('All');
  }, [initialGradeFilter]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // ── Fetch Live Data ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [studentsRes, classesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/classes', { headers }).catch(() => ({ data: [] }))
        ]);

        setAllClasses(classesRes.data);

        const liveStudents = studentsRes.data.map(dbStudent => ({
          id: dbStudent.id,
          admissionNumber: dbStudent.admission_number,
          fullName: dbStudent.full_name || 'Unnamed Student', // Matching the new schema
          grade: dbStudent.grade_name,
          section: dbStudent.section_code ? `Section ${dbStudent.section_code}` : 'Section A',
          campus: dbStudent.campus_name || 'Unknown Campus',
          fatherName: dbStudent.father_name || 'N/A', 
          motherName: dbStudent.mother_name || 'N/A', 
          phone: dbStudent.phone || 'N/A',
          status: dbStudent.status ? (dbStudent.status.charAt(0).toUpperCase() + dbStudent.status.slice(1)) : 'Active',
          dateOfBirth: dbStudent.date_of_birth ? dbStudent.date_of_birth.split('T')[0] : '',
          gender: dbStudent.gender || 'Male',
          address: dbStudent.address || '',
          previousSchool: dbStudent.previous_school || '',
          testResult: dbStudent.test_result || '',
          admissionStatus: dbStudent.admission_status || 'Confirmed'
        }));

        setStudents(liveStudents);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Data Error", { description: "Could not load data from the database." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // ── Dynamic Dropdown Generators ─────────────────────────────────────────
  const filterClassOptions = ['All', ...new Set(allClasses
    .filter(c => selectedCampus === 'Both' || selectedCampus === 'All Campuses' || c.campus_name.includes(selectedCampus))
    .map(c => `${c.grade_name} - ${c.section_name}`)
  )].sort();

  const formClassOptions = [...new Set(allClasses
    .filter(c => formData.campus && c.campus_name.includes(formData.campus))
    .map(c => `${c.grade_name} - ${c.section_name}`)
  )].sort();

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchCampus = selectedCampus === 'Both' || selectedCampus === 'All Campuses' || (s.campus && s.campus.includes(selectedCampus));
    const matchSearch = searchQuery === '' || 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.motherName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchClass = filterClass === 'All' || `${s.grade} - ${s.section}` === filterClass;
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    
    return matchCampus && matchSearch && matchClass && matchStatus;
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCampusChange = (newCampus) => {
    const campusClasses = allClasses.filter(c => c.campus_name.includes(newCampus)).map(c => `${c.grade_name} - ${c.section_name}`);
    setFormData(p => ({ ...p, campus: newCampus, classSelection: campusClasses[0] || '' }));
  };

  const handleAdd = () => {
    // NEW: No more hardcoded 'North Campus'. It dynamically picks the first available campus.
    const defaultCampus = (selectedCampus === 'Both' || selectedCampus === 'All Campuses') 
        ? (campuses[0]?.name || '') 
        : selectedCampus;
        
    const campusClasses = allClasses.filter(c => c.campus_name.includes(defaultCampus)).map(c => `${c.grade_name} - ${c.section_name}`);
    setFormData({ ...emptyForm, campus: defaultCampus, classSelection: campusClasses[0] || '' });
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.fullName || !formData.classSelection || !formData.admissionNumber) {
      toast.error('Required Fields Missing', { description: 'Name, GR Number, and Class are required.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const [gradePart, sectionPart] = formData.classSelection.split(' - ');
      const sectionCode = sectionPart ? sectionPart.replace('Section ', '') : 'A';

      const payload = { ...formData, grade: gradePart, section: sectionCode };

      await axios.post('http://localhost:5000/api/students', payload, { headers: { Authorization: `Bearer ${token}` } });

      addAuditLog({ action: 'Student Added', user: currentUser.name, details: `New enrollment - ${formData.fullName}` });
      toast.success('Student Added Successfully');
      setShowAddModal(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to Add', { description: error.response?.data?.error || 'Server error.' });
    }
  };

  const handleEdit = (student) => {
    setFormData({ ...student, classSelection: `${student.grade} - ${student.section}` });
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleViewDetail = (student) => { setSelectedStudent(student); setShowDetailModal(true); };
  const handleDelete = (student) => { setSelectedStudent(student); setShowDeleteModal(true); };
  const handleConfirmDelete = () => { toast.info('API Pending'); setShowDeleteModal(false); };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg text-black">Student Records</h3>
            <p className="text-sm text-gray-500 mt-1">{isLoading ? 'Loading...' : `${filtered.length} students at ${selectedCampus}`}</p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            <Plus className="size-4" /> Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input type="text" placeholder="Search name, GR No, or parent..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm" />
            </div>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
              {filterClassOptions.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
              <option value="All">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs">GR No.</th>
                <th className="px-4 py-3 text-left text-xs">Full Name</th>
                <th className="px-4 py-3 text-left text-xs">Class</th>
                <th className="px-4 py-3 text-left text-xs">Father's Name</th>
                <th className="px-4 py-3 text-left text-xs">Mother's Name</th>
                <th className="px-4 py-3 text-left text-xs">Status</th>
                <th className="px-4 py-3 text-center text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(student)}>
                  <td className="px-4 py-3 text-xs font-mono">{student.admissionNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium">{student.fullName}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{student.grade} – {student.section}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.fatherName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.motherName}</td>
                  <td className="px-4 py-3 text-xs"><span className={`px-2 py-0.5 rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{student.status}</span></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(student)} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit2 className="size-4 text-blue-600" /></button>
                      <button onClick={() => handleDelete(student)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="size-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-500 italic">No students found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => { if (!open) { setShowAddModal(false); setShowEditModal(false); }}}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showEditModal ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader>
          
          <div className="grid grid-cols-1 gap-6 mt-4">
            {/* Column 1: Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-black border-b pb-2">Student Identity</h4>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name (As per CSV) *</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">GR Number *</label>
                  <input type="text" value={formData.admissionNumber} onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Father's Name</label>
                  <input type="text" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mother's Name</label>
                  <input type="text" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                </div>
              </div>
            </div>

            {/* Column 2: Admission Pipeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-black border-b pb-2">Academic & Admission</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Campus *</label>
                  <select value={formData.campus} onChange={(e) => handleCampusChange(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm">
                    {/* NEW: Fully dynamic campus dropdown from Database! */}
                    {campuses.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Class Assignment *</label>
                  <select value={formData.classSelection} onChange={(e) => setFormData(p => ({...p, classSelection: e.target.value}))} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-red-600 outline-none">
                    {formClassOptions.length === 0 ? (
                      <option value="">No classes configured</option>
                    ) : (
                      formClassOptions.map(c => <option key={c} value={c}>{c}</option>)
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Previous School</label>
                <input type="text" value={formData.previousSchool} onChange={(e) => setFormData({...formData, previousSchool: e.target.value})} placeholder="e.g. City Public School" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Test Result</label>
                  <input type="text" value={formData.testResult} onChange={(e) => setFormData({...formData, testResult: e.target.value})} placeholder="e.g. 85%" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Admission Status</label>
                  <select value={formData.admissionStatus} onChange={(e) => setFormData({...formData, admissionStatus: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Waiting">Waiting List</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div>
                 <label className="block text-sm text-gray-700 mb-1">Account Status</label>
                 <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none text-sm">
                    <option value="Active">Active Student</option>
                    <option value="Inactive">Inactive / Alumni</option>
                 </select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</Button>
            <Button onClick={handleSaveAdd} disabled={!formData.classSelection || !formData.fullName || !formData.admissionNumber} className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
              {showEditModal ? 'Save Changes' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><div className="flex items-center gap-3"><div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"><User className="size-6 text-white" /></div><div><DialogTitle>{selectedStudent?.fullName}</DialogTitle><DialogDescription>GR: {selectedStudent?.admissionNumber}</DialogDescription></div></div></DialogHeader>
          <div className="space-y-2 text-sm py-2">
            {[
              ['Campus', selectedStudent?.campus], 
              ['Grade & Section', `${selectedStudent?.grade} – ${selectedStudent?.section}`], 
              ["Father's Name", selectedStudent?.fatherName], 
              ["Mother's Name", selectedStudent?.motherName], 
              ['Phone', selectedStudent?.phone],
              ['Previous School', selectedStudent?.previousSchool || 'N/A'],
              ['Admission Status', selectedStudent?.admissionStatus],
              ['Account Status', selectedStudent?.status]
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2"><span className="text-gray-500 w-32">{label}:</span><span className="text-black">{value}</span></div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowDetailModal(false); handleEdit(selectedStudent); }}><Edit2 className="size-4 mr-1" /> Edit</Button><Button onClick={() => setShowDetailModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}