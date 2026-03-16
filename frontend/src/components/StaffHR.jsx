import { useState } from 'react';
import { Plus, Eye, Edit, Search, UserCheck } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';

const mockStaff = [
  { id: 'STF001', name: 'Ms. Sana Khan',     role: 'Teacher',    department: 'Mathematics',    campus: 'North Campus', email: 'sana@bridgefoundation.org',   phone: '+92 300 1234567', joiningDate: '2020-01-15', status: 'Active' },
  { id: 'STF002', name: 'Mr. Ahmed Raza',    role: 'Teacher',    department: 'English',        campus: 'South Campus', email: 'ahmed@bridgefoundation.org',  phone: '+92 301 2345678', joiningDate: '2019-08-20', status: 'Active' },
  { id: 'STF003', name: 'Ms. Fatima Noor',   role: 'Teacher',    department: 'Science',        campus: 'South Campus', email: 'fatima@bridgefoundation.org', phone: '+92 302 3456789', joiningDate: '2021-03-10', status: 'Active' },
  { id: 'STF004', name: 'Mr. Hassan Ali',    role: 'Admin Staff', department: 'Administration', campus: 'North Campus', email: 'hassan@bridgefoundation.org', phone: '+92 303 4567890', joiningDate: '2018-06-01', status: 'Active' },
  { id: 'STF005', name: 'Ms. Zainab Ali',    role: 'Teacher',    department: 'Urdu',           campus: 'North Campus', email: 'zainab@bridgefoundation.org', phone: '+92 304 5678901', joiningDate: '2022-01-20', status: 'Active' },
  { id: 'STF006', name: 'Mr. Usman Farooq',  role: 'Coordinator', department: 'Student Affairs', campus: 'South Campus', email: 'usman@bridgefoundation.org', phone: '+92 305 6789012', joiningDate: '2020-09-15', status: 'On Leave' },
  { id: 'STF007', name: 'Ms. Ayesha Malik',  role: 'Teacher',    department: 'Social Studies', campus: 'North Campus', email: 'ayesha@bridgefoundation.org', phone: '+92 306 7890123', joiningDate: '2021-07-01', status: 'Active' },
  { id: 'STF008', name: 'Mr. Ibrahim Qureshi', role: 'IT Support', department: 'Technology',   campus: 'Both',         email: 'ibrahim@bridgefoundation.org', phone: '+92 307 8901234', joiningDate: '2019-11-10', status: 'Active' },
];

const ROLES = ['All', 'Teacher', 'Admin Staff', 'Coordinator', 'IT Support'];
const DEPARTMENTS = ['All', 'Mathematics', 'English', 'Science', 'Urdu', 'Social Studies', 'Administration', 'Student Affairs', 'Technology'];
const ROLE_OPTIONS = ['Teacher', 'Admin Staff', 'Coordinator', 'IT Support'];
const DEPT_OPTIONS = ['Mathematics', 'English', 'Science', 'Urdu', 'Social Studies', 'Administration', 'Student Affairs', 'Technology'];
const CAMPUS_OPTIONS = ['North Campus', 'South Campus', 'Both'];
const STATUS_OPTIONS = ['Active', 'On Leave', 'Inactive'];

const emptyForm = { name: '', role: '', department: '', campus: 'North Campus', email: '', phone: '', joiningDate: '', status: 'Active' };

function statusBadgeClass(status) {
  if (status === 'Active') return 'bg-green-100 text-green-800';
  if (status === 'On Leave') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

export function StaffHR() {
  const { selectedCampus } = useCampus();
  const toast = useToast();

  const [staffList, setStaffList] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeCardFilter, setActiveCardFilter] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const filtered = staffList.filter((s) => {
    const matchCampus = s.campus === selectedCampus || s.campus === 'Both';
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchRole = filterRole === 'All' || s.role === filterRole;
    const matchDept = filterDept === 'All' || s.department === filterDept;
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchCampus && matchSearch && matchRole && matchDept && matchStatus;
  });

  const campusStaff = staffList.filter((s) => s.campus === selectedCampus || s.campus === 'Both');

  const handleCardFilter = (type) => {
    if (activeCardFilter === type) {
      setActiveCardFilter(null);
      setFilterStatus('All');
      setFilterRole('All');
    } else {
      setActiveCardFilter(type);
      if (type === 'active')   { setFilterStatus('Active');   setFilterRole('All'); }
      if (type === 'onleave')  { setFilterStatus('On Leave'); setFilterRole('All'); }
      if (type === 'teachers') { setFilterRole('Teacher');    setFilterStatus('All'); }
      if (type === 'all')      { setFilterStatus('All');      setFilterRole('All'); }
    }
  };

  const handleStatusChange = (staff, newStatus) => {
    setStaffList((prev) => prev.map((s) => s.id === staff.id ? { ...s, status: newStatus } : s));
    toast.success(`Status updated to ${newStatus} for ${staff.name}`);
  };

  const handleSaveEdit = () => {
    setStaffList((prev) => prev.map((s) => s.id === selectedStaff.id ? { ...s, ...formData } : s));
    toast.success(`Updated ${formData.name}'s details`);
    setEditOpen(false);
  };

  const handleSaveAdd = () => {
    if (!formData.name || !formData.role || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newId = `STF${String(staffList.length + 1).padStart(3, '0')}`;
    setStaffList((prev) => [...prev, {
      id: newId,
      name: formData.name,
      role: formData.role,
      department: formData.department,
      campus: formData.campus,
      email: formData.email || '',
      phone: formData.phone || '',
      joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'Active',
    }]);
    toast.success(`Added ${formData.name} to staff directory`);
    setAddOpen(false);
    setFormData(emptyForm);
  };

  const inputClass = "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm";

  const stats = [
    { type: 'all',      label: 'Total Staff', value: filtered.length,                                            color: 'bg-red-600',    border: 'border-red-600' },
    { type: 'active',   label: 'Active',       value: campusStaff.filter(s => s.status === 'Active').length,    color: 'bg-green-600',  border: 'border-green-600' },
    { type: 'onleave',  label: 'On Leave',     value: campusStaff.filter(s => s.status === 'On Leave').length,  color: 'bg-yellow-600', border: 'border-yellow-600' },
    { type: 'teachers', label: 'Teachers',     value: campusStaff.filter(s => s.role === 'Teacher').length,     color: 'bg-black',      border: 'border-black' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-black">Staff & HR Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage all staff members at {selectedCampus}</p>
        </div>
        <button
          onClick={() => { setFormData({ ...emptyForm, campus: selectedCampus }); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <Plus className="size-4" />
          Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button
            key={s.type}
            onClick={() => handleCardFilter(s.type)}
            className={`bg-white border-2 rounded-lg p-4 text-left transition-all hover:shadow-md ${activeCardFilter === s.type ? s.border + ' shadow-md' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 ${s.color} rounded-lg`}>
                <UserCheck className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">{s.label}</p>
                <p className="text-xl text-black">{s.value}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-black text-white">
              <tr>
                {['Staff ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Joining Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-black">{staff.id}</td>
                  <td className="px-4 py-3 text-sm text-black">{staff.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{staff.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{staff.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{staff.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{staff.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{staff.joiningDate}</td>
                  <td className="px-4 py-3">
                    <select
                      value={staff.status}
                      onChange={(e) => handleStatusChange(staff, e.target.value)}
                      className={`px-2 py-1 text-xs rounded border-0 cursor-pointer ${statusBadgeClass(staff.status)}`}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedStaff(staff); setViewOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="size-4 text-gray-700" />
                      </button>
                      <button onClick={() => { setSelectedStaff(staff); setFormData({ ...staff }); setEditOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit className="size-4 text-gray-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Staff Profile</DialogTitle>
            <DialogDescription>Detailed information for this staff member</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="size-14 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg text-black">{selectedStaff.name}</h4>
                  <p className="text-sm text-gray-600">{selectedStaff.role} • {selectedStaff.department}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${statusBadgeClass(selectedStaff.status)}`}>
                    {selectedStaff.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Staff ID', selectedStaff.id], ['Campus', selectedStaff.campus], ['Joining Date', selectedStaff.joiningDate], ['Email', selectedStaff.email], ['Phone', selectedStaff.phone]].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-black mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button onClick={() => setViewOpen(false)} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Close</button>
                <button onClick={() => { setViewOpen(false); setFormData({ ...selectedStaff }); setEditOpen(true); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Edit Staff</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div><label className="block text-sm text-gray-700 mb-1">Full Name *</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Email</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Phone</label><input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Joining Date</label><input type="date" value={formData.joiningDate || ''} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} className={inputClass} /></div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role *</label>
              <select value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass}>
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Department *</label>
              <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass}>
                <option value="">Select Department</option>
                {DEPT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Campus</label>
              <select value={formData.campus || ''} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} className={inputClass}>
                {CAMPUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Save Changes</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>Fill in the details to add a new staff member</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div><label className="block text-sm text-gray-700 mb-1">Full Name *</label><input type="text" placeholder="Enter full name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Email</label><input type="email" placeholder="email@bridgefoundation.org" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Phone</label><input type="tel" placeholder="+92 300 1234567" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Joining Date</label><input type="date" value={formData.joiningDate || ''} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} className={inputClass} /></div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role *</label>
              <select value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass}>
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Department *</label>
              <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass}>
                <option value="">Select Department</option>
                {DEPT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Campus</label>
              <select value={formData.campus || 'North Campus'} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} className={inputClass}>
                {CAMPUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => { setAddOpen(false); setFormData(emptyForm); }} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleSaveAdd} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Add Staff Member</button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}