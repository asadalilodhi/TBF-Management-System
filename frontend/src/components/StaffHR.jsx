import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Eye, Edit, Search, UserCheck } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';

const ROLES = ['All', 'teacher', 'staff', 'campus_admin'];
const DEPARTMENTS = ['All', 'Academic', 'Administration', 'IT Support', 'Finance'];
const ROLE_OPTIONS = ['teacher', 'staff', 'campus_admin'];
const DEPT_OPTIONS = ['Academic', 'Administration', 'IT Support', 'Finance'];
const STATUS_OPTIONS = ['active', 'On Leave', 'inactive'];

const emptyForm = { 
  fullName: '', email: '', role: '', campusId: '', employeeId: '', 
  phone: '', designation: '', department: '', joiningDate: '', status: 'active' 
};

function statusBadgeClass(status) {
  if (status === 'Active') return 'bg-green-100 text-green-800';
  if (status === 'On Leave') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

export function StaffHR() {
  const { selectedCampus, campuses } = useCampus(); // Added campuses for dropdown
  const toast = useToast();
  
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaffDirectory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/staff', {
          headers: { Authorization: `Bearer ${token}` },
          params: { campus: selectedCampus } // Pass the campus to the API
        }).catch(() => ({ data: [] }));

        setStaffList(response.data || []);
      } catch (error) {
        toast.error("Error", { description: "Failed to load staff directory." });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCampus && selectedCampus !== 'No Campus Available') {
      fetchStaffDirectory();
    } else {
      setStaffList([]);
      setIsLoading(false);
    }
  }, [selectedCampus]);

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

  const handleEditClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      fullName: staffMember.full_name || staffMember.name || '',
      email: staffMember.user_email || staffMember.email || '',
      role: staffMember.user_role || staffMember.role || '',
      campusId: staffMember.campus_id || '',
      employeeId: staffMember.employee_id || staffMember.id || '',
      phone: staffMember.phone || '',
      designation: staffMember.designation || '',
      department: staffMember.department || '',
      joiningDate: staffMember.joining_date ? staffMember.joining_date.split('T')[0] : staffMember.joiningDate || '',
      status: staffMember.status || 'active'
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/staff/${selectedStaff.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update UI
      setStaffList((prev) => prev.map((s) => s.id === selectedStaff.id ? { ...s, ...formData, full_name: formData.fullName, user_role: formData.role } : s));
      toast.success(`Updated ${formData.fullName}'s details`);
      setEditOpen(false);
    } catch (error) {
      toast.error('Failed to update staff');
    }
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
                      <button onClick={() => handleEditClick(staff)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
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
                  {selectedStaff.full_name ? selectedStaff.full_name.charAt(0) : 'U'}
                </div>
                <div>
                  <h4 className="text-lg text-black">{selectedStaff.full_name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{(selectedStaff.user_role || '').replace('_', ' ')} • {selectedStaff.department}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${statusBadgeClass(selectedStaff.status)}`}>
                    {selectedStaff.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Employee ID', selectedStaff.employee_id || 'Pending'], 
                  ['Campus', selectedStaff.campus_name || selectedCampus], 
                  ['Joining Date', selectedStaff.joining_date ? selectedStaff.joining_date.split('T')[0] : ''], 
                  ['Email', selectedStaff.user_email], 
                  ['Phone', selectedStaff.phone || 'N/A']
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-black mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button onClick={() => setViewOpen(false)} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Close</button>
                <button onClick={() => { setViewOpen(false); handleEditClick(selectedStaff); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Edit Staff</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
            <DialogDescription>Update system role, department, and campus assignments.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Column 1: System Access */}
            <div className="space-y-4">
              <h4 className="font-semibold text-black border-b pb-2">System Access</h4>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email (Login ID)</label>
                <input type="email" value={formData.email} disabled className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} title="Emails cannot be changed here" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">System Role *</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className={`${inputClass} capitalize`}>
                    <option value="" disabled>Select Role</option>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Assigned Campus *</label>
                  <select value={formData.campusId} onChange={(e) => setFormData({...formData, campusId: e.target.value})} className={inputClass}>
                    <option value="" disabled>Select Campus</option>
                    {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Column 2: Employment Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-black border-b pb-2">Employment Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Employee ID</label>
                  <input type="text" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Department *</label>
                  <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className={inputClass}>
                    <option value="" disabled>Select Department</option>
                    {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Joining Date</label>
                  <input type="date" value={formData.joiningDate} onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className={`${inputClass} capitalize`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
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
      </Dialog>

    </div>
  );
}