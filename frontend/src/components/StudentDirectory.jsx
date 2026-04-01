import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, User, ArrowRightLeft, CheckSquare, Square } from 'lucide-react';
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

// ── Seed data ────────────────────────────────────────────────────────────────
const initialStudents = [
  { id: '1', grNumber: 'GR001', name: 'Muhammad Ahmed Khan', grade: 'Grade 5', section: 'A', campus: 'North Campus', guardianName: 'Mr. Khalid Khan', phone: '0300-1234567', scholarship: '50%', status: 'Active', dob: '2015-03-12', address: 'House 45, Block 7, North District' },
  { id: '2', grNumber: 'GR002', name: 'Ayesha Malik', grade: 'Grade 4', section: 'A', campus: 'North Campus', guardianName: 'Mr. Tariq Malik', phone: '0321-9876543', scholarship: 'None', status: 'Active', dob: '2016-07-22', address: 'Flat 12, Block A, North Campus Area' },
  { id: '3', grNumber: 'GR003', name: 'Hassan Ali', grade: 'Grade 3', section: 'A', campus: 'North Campus', guardianName: 'Mrs. Amina Ali', phone: '0333-1122334', scholarship: '100%', status: 'Active', dob: '2017-01-05', address: 'Street 9, Gulshan Colony' },
  { id: '4', grNumber: 'GR004', name: 'Fatima Noor', grade: 'Grade 2', section: 'B', campus: 'North Campus', guardianName: 'Mr. Noor Ahmed', phone: '0345-5566778', scholarship: '25%', status: 'Active', dob: '2018-09-14', address: 'Block 3, Model Town' },
  { id: '5', grNumber: 'GR005', name: 'Usman Farooq', grade: 'Grade 5', section: 'B', campus: 'South Campus', guardianName: 'Mr. Farooq Ahmed', phone: '0311-3344556', scholarship: 'None', status: 'Active', dob: '2015-11-30', address: 'Plot 77, South Block' },
  { id: '6', grNumber: 'GR006', name: 'Zainab Hussain', grade: 'Grade 4', section: 'A', campus: 'South Campus', guardianName: 'Mrs. Rukhsana Hussain', phone: '0322-7788990', scholarship: '75%', status: 'Active', dob: '2016-04-18', address: 'House 22, South District' },
  { id: '7', grNumber: 'GR007', name: 'Ibrahim Qureshi', grade: 'Grade 3', section: 'A', campus: 'South Campus', guardianName: 'Mr. Qureshi Sab', phone: '0300-9988776', scholarship: '100%', status: 'Active', dob: '2017-06-25', address: 'Qureshi Manzil, South Area' },
  { id: '8', grNumber: 'GR008', name: 'Maryam Siddiqui', grade: 'Grade 2', section: 'A', campus: 'North Campus', guardianName: 'Mr. Siddiqui', phone: '0301-2233445', scholarship: 'None', status: 'Inactive', dob: '2018-02-08', address: 'Block 5, Siddiqui Colony' },
  { id: '9', grNumber: 'GR009', name: 'Ali Hassan', grade: 'Grade 1', section: 'A', campus: 'North Campus', guardianName: 'Mrs. Haseena', phone: '0312-6677889', scholarship: '50%', status: 'Active', dob: '2019-08-19', address: 'Lane 4, North Old Town' },
  { id: '10', grNumber: 'GR010', name: 'Hira Qamar', grade: 'Grade 1', section: 'B', campus: 'South Campus', guardianName: 'Mr. Qamar Abbas', phone: '0324-4455667', scholarship: 'None', status: 'Active', dob: '2019-12-03', address: 'Flat 7C, South Residency' },
];

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
const SECTIONS = ['A', 'B', 'C'];
const SCHOLARSHIPS = ['None', '25%', '50%', '75%', '100%'];
const CAMPUSES = ['North Campus', 'South Campus'];

const emptyForm = {
  grNumber: '', name: '', grade: 'Grade 1', section: 'A',
  campus: 'North Campus', guardianName: '', phone: '',
  scholarship: 'None', status: 'Active', dob: '', address: '',
};

export function StudentDirectory({ initialGradeFilter }) {
  const { selectedCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const { currentUser } = useUser();
  const toast = useToast();

  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState(initialGradeFilter || 'All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // New State for Transfer Feature
  const [selectedIds, setSelectedIds] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDestination, setTransferDestination] = useState('');

  useEffect(() => {
    setFilterGrade(initialGradeFilter || 'All');
  }, [initialGradeFilter]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchCampus = s.campus === selectedCampus;
    const matchSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGrade = filterGrade === 'All' || s.grade === filterGrade;
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchCampus && matchSearch && matchGrade && matchStatus;
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  
  // Checkbox Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s.id));
    }
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation(); // Prevent opening detail modal
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkTransfer = () => {
    if (!transferDestination) {
      toast.error("Destination Required", { description: "Please select a campus to transfer to." });
      return;
    }

    setStudents(prev => prev.map(s => 
      selectedIds.includes(s.id) ? { ...s, campus: transferDestination } : s
    ));

    addAuditLog({
      action: 'Bulk Transfer',
      user: currentUser.name,
      details: `Transferred ${selectedIds.length} students to ${transferDestination}`,
    });

    toast.success("Transfer Complete", { description: `Successfully moved ${selectedIds.length} students.` });
    setSelectedIds([]);
    setShowTransferModal(false);
    setTransferDestination('');
  };

  const handleAdd = () => {
    setFormData({ ...emptyForm, campus: selectedCampus });
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    if (!formData.grNumber || !formData.name) {
      toast.error('Required Fields Missing', { description: 'GR Number and Student Name are required.' });
      return;
    }
    if (students.find((s) => s.grNumber === formData.grNumber)) {
      toast.error('Duplicate GR Number', { description: `GR Number ${formData.grNumber} already exists.` });
      return;
    }
    const newStudent = { ...formData, id: String(Date.now()) };
    setStudents((prev) => [...prev, newStudent]);
    addAuditLog({
      action: 'Student Added',
      user: currentUser.name,
      details: `New enrollment - ${formData.name} (${formData.grNumber})`,
    });
    toast.success('Student Added', { description: `${formData.name} has been enrolled successfully.` });
    setShowAddModal(false);
  };

  const handleEdit = (student) => {
    setFormData({ ...student });
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? { ...formData } : s)));
    addAuditLog({
      action: 'Student Updated',
      user: currentUser.name,
      details: `Updated record for ${formData.name} (${formData.grNumber})`,
    });
    toast.success('Student Updated', { description: `${formData.name}'s record has been updated.` });
    setShowEditModal(false);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
    addAuditLog({ action: 'Student Removed', user: currentUser.name, details: `Removed student ${selectedStudent.name}` });
    toast.info('Student Removed');
    setShowDeleteModal(false);
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const field = (key, label, type = 'text', options = null) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select value={formData[key]} onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none">
          {options.map((o) => ( <option key={o} value={o}>{o}</option> ))}
        </select>
      ) : (
        <input type={type} value={formData[key]} onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none" />
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg text-black">Student Records</h3>
            <p className="text-sm text-gray-500">{filtered.length} students at {selectedCampus}</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm shadow-md"
              >
                <ArrowRightLeft className="size-4" /> Transfer ({selectedIds.length})
              </button>
            )}
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-md">
              <Plus className="size-4" /> Add Student
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" placeholder="Search by name, GR, or guardian..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none" />
          </div>
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none">
            <option value="All">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input 
                    type="checkbox" 
                    className="accent-red-600"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs">GR No.</th>
                <th className="px-4 py-3 text-left text-xs">Name</th>
                <th className="px-4 py-3 text-left text-xs">Grade/Section</th>
                <th className="px-4 py-3 text-left text-xs">Guardian</th>
                <th className="px-4 py-3 text-left text-xs">Status</th>
                <th className="px-4 py-3 text-center text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(student)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="accent-red-600"
                      checked={selectedIds.includes(student.id)}
                      onChange={(e) => toggleSelect(e, student.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{student.grNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-xs">{student.grade} – {student.section}</td>
                  <td className="px-4 py-3 text-xs">{student.guardianName}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEdit(student)} className="p-1.5 hover:bg-blue-50 rounded"><Edit2 className="size-4 text-blue-600" /></button>
                      <button onClick={() => handleDelete(student)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="size-4 text-red-500" /></button>
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

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-orange-500" />
              Transfer Students
            </DialogTitle>
            <DialogDescription>
              Moving {selectedIds.length} selected student(s) from <strong>{selectedCampus}</strong> to another campus.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Campus</label>
            <select 
              value={transferDestination} 
              onChange={(e) => setTransferDestination(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none"
            >
              <option value="">Select Destination Campus</option>
              {CAMPUSES.filter(c => c !== selectedCampus).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
            <Button onClick={handleBulkTransfer} className="bg-orange-500 hover:bg-orange-600 text-white">Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {field('grNumber', 'GR Number *')} {field('name', 'Full Name *')}
            {field('dob', 'Date of Birth', 'date')} {field('grade', 'Grade', 'text', GRADES)}
            {field('section', 'Section', 'text', SECTIONS)} {field('campus', 'Campus', 'text', CAMPUSES)}
            {field('guardianName', "Guardian's Name")} {field('phone', 'Phone', 'tel')}
            {field('scholarship', 'Scholarship', 'text', SCHOLARSHIPS)} {field('status', 'Status', 'text', ['Active', 'Inactive'])}
            <div className="col-span-2">{field('address', 'Address')}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleSaveAdd} className="bg-red-600 text-white">Add Student</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {field('grNumber', 'GR Number')} {field('name', 'Full Name')}
            {field('dob', 'Date of Birth', 'date')} {field('grade', 'Grade', 'text', GRADES)}
            {field('section', 'Section', 'text', SECTIONS)} {field('campus', 'Campus', 'text', CAMPUSES)}
            {field('guardianName', "Guardian's Name")} {field('phone', 'Phone', 'tel')}
            {field('scholarship', 'Scholarship', 'text', SCHOLARSHIPS)} {field('status', 'Status', 'text', ['Active', 'Inactive'])}
            <div className="col-span-2">{field('address', 'Address')}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button><Button onClick={handleSaveEdit} className="bg-red-600 text-white">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Student</DialogTitle><DialogDescription>Are you sure you want to remove {selectedStudent?.name}?</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button onClick={handleConfirmDelete} className="bg-red-600 text-white">Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><div className="flex items-center gap-3"><div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"><User className="size-6 text-white" /></div><div><DialogTitle>{selectedStudent?.name}</DialogTitle><DialogDescription>{selectedStudent?.grNumber}</DialogDescription></div></div></DialogHeader>
          <div className="space-y-2 text-sm py-2">
            {[['Campus', selectedStudent?.campus], ['Grade & Section', `${selectedStudent?.grade} – ${selectedStudent?.section}`], ['Guardian', selectedStudent?.guardianName], ['Phone', selectedStudent?.phone], ['Status', selectedStudent?.status], ['Address', selectedStudent?.address]].map(([label, value]) => (
              <div key={label} className="flex gap-2"><span className="text-gray-500 w-28">{label}:</span><span className="text-black">{value}</span></div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowDetailModal(false); handleEdit(selectedStudent); }}><Edit2 className="size-4 mr-1" /> Edit</Button><Button onClick={() => setShowDetailModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}