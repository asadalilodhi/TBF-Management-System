import { useState } from 'react';
import { Shield, Settings as SettingsIcon, Database, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useUser, mockUsers } from './UserContext.jsx';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';

const emptyForm = { name: '', address: '', phone: '' };

export function AdminSettings() {
  const { currentUser } = useUser();
  const { campuses, addCampus, updateCampus, deleteCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const toast = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Please enter a campus name'); return; }
    addCampus({ ...form, isActive: true });
    addAuditLog({ action: 'Campus Added', user: currentUser.name, details: `New campus: ${form.name}` });
    toast.success('Campus Added', { description: `${form.name} has been created` });
    setForm(emptyForm);
    setShowAddDialog(false);
  };

  const handleEdit = () => {
    if (!form.name.trim() || !editingId) { toast.error('Please enter a campus name'); return; }
    updateCampus(editingId, form);
    addAuditLog({ action: 'Campus Updated', user: currentUser.name, details: `Campus updated: ${form.name}` });
    toast.success('Campus Updated');
    setForm(emptyForm);
    setEditingId(null);
    setShowEditDialog(false);
  };

  const handleDelete = (id, name) => {
    if (campuses.length <= 1) { toast.error('Cannot delete the last campus'); return; }
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    deleteCampus(id);
    addAuditLog({ action: 'Campus Deleted', user: currentUser.name, details: `Campus deleted: ${name}` });
    toast.success('Campus Deleted');
  };

  const openEdit = (id) => {
    const c = campuses.find((x) => x.id === id);
    if (!c) return;
    setForm({ name: c.name, address: c.address, phone: c.phone });
    setEditingId(id);
    setShowEditDialog(true);
  };

  const activeCampuses = campuses.filter((c) => c.isActive);

  const campusFormFields = (
    <div className="space-y-4">
      {[
        ['name', 'Campus Name *', 'e.g., East Campus'],
        ['address', 'Address', 'e.g., Block C, East District, Karachi'],
        ['phone', 'Phone', 'e.g., +92-21-1111-0003'],
      ].map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-sm text-gray-700 mb-2">{label}</label>
          <input
            type="text"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Campus Management - Super Admin Only */}
      {currentUser.role === 'super_admin' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black flex items-center gap-2">
              <Building2 className="size-5" /> Campus Management
            </h3>
            <button
              onClick={() => { setForm(emptyForm); setShowAddDialog(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
            >
              <Plus className="size-4" /> Add New Campus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campuses.map((campus) => (
              <div
                key={campus.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-sm hover:border-red-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-red-600" />
                    <h4 className="text-black font-medium">{campus.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${campus.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {campus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 w-16">Address:</span>
                    <span className="text-xs text-gray-700 flex-1">{campus.address || 'Not specified'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 w-16">Phone:</span>
                    <span className="text-xs text-gray-700 flex-1">{campus.phone || 'Not specified'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button onClick={() => openEdit(campus.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    <Edit className="size-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(campus.id, campus.name)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Access Management */}
      <div>
        <h3 className="text-lg text-black mb-4 flex items-center gap-2">
          <Shield className="size-5" /> User Access Management
        </h3>
        <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-black text-white">
                <tr>
                  {['User ID', 'Name', 'Role', 'Campus', 'Email', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-black">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Teacher'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.campus}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 text-xs rounded bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-sm text-red-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
            + Add New User
          </button>
        </div>
      </div>

      {/* System Config */}
      <div>
        <h3 className="text-lg text-black mb-4 flex items-center gap-2">
          <SettingsIcon className="size-5" /> System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Campus Configuration',
              rows: [
                ['Total Campuses', activeCampuses.length],
                ...activeCampuses.slice(0, 3).map((c) => [c.name, 'Active']),
                ['Total Teachers', 24],
              ],
            },
            {
              title: 'Academic Year',
              rows: [['Current Year', '2025-2026'], ['Start Date', 'Aug 1, 2025'], ['End Date', 'Jun 30, 2026']],
            },
            {
              title: 'Student Information',
              rows: [
                ['Total Students', 524],
                ...activeCampuses.slice(0, 2).map((c, i) => [c.name, `${i === 0 ? 287 : 237} students`]),
              ],
            },
            {
              title: 'Scholarship Statistics',
              rows: [['Active Scholarships', 156], ['Full (100%)', 42], ['Partial', 114]],
            },
          ].map((card) => (
            <div key={card.title} className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="text-black mb-4">{card.title}</h4>
              <div className="space-y-3">
                {card.rows.map(([label, val], i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700">{label}</span>
                    <span className="text-sm text-black">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div>
        <h3 className="text-lg text-black mb-4 flex items-center gap-2">
          <Database className="size-5" /> Database & Backup
        </h3>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Last Backup</p>
              <p className="text-xs text-gray-600 mt-1">March 2, 2026 at 11:45 PM</p>
            </div>
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
              Create Backup
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-200">
            Automatic backups scheduled daily at 11:45 PM. Stored securely for 30 days.
          </p>
        </div>
      </div>

      {currentUser.role !== 'super_admin' && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some settings are restricted to Super Admin users only.
          </p>
        </div>
      )}

      {/* Add Campus Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Campus</DialogTitle>
            <DialogDescription>Create a new campus for The Bridge Foundation</DialogDescription>
          </DialogHeader>
          {campusFormFields}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => { setShowAddDialog(false); setForm(emptyForm); }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Add Campus</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campus Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campus</DialogTitle>
            <DialogDescription>Update campus information</DialogDescription>
          </DialogHeader>
          {campusFormFields}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => { setShowEditDialog(false); setForm(emptyForm); setEditingId(null); }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            <button onClick={handleEdit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Update Campus</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}