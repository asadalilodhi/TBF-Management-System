import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Settings as SettingsIcon, Database, Plus, Edit, Trash2, Building2, UserPlus, Users } from 'lucide-react';
import { useUser } from './UserContext.jsx';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';

const emptyCampusForm = { name: '', address: '', phone: '' };


export function AdminSettings() {
  const { currentUser } = useUser();
  const { campuses, addCampus, updateCampus, deleteCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const toast = useToast();

  // Campus States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCampusForm);

  // ── Campus Handlers ───────────────────────────────────────────────
  const handleAddCampus = async () => {
    if (!form.name.trim()) return toast.error('Campus name is required');
    try {
      await addCampus({ ...form, code: `CMP-${Date.now().toString().slice(-4)}` });
      addAuditLog({ action: 'Campus Created', user: currentUser.name, details: form.name });
      toast.success('Campus added successfully');
      setShowAddDialog(false);
      setForm(emptyCampusForm);
    } catch (error) {
      toast.error('Failed to add campus');
    }
  };

  const handleEditCampus = async () => {
    if (!form.name.trim()) return toast.error('Campus name is required');
    try {
      await updateCampus(editingId, form);
      addAuditLog({ action: 'Campus Updated', user: currentUser.name, details: form.name });
      toast.success('Campus updated successfully');
      setShowEditDialog(false);
      setForm(emptyCampusForm);
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update campus');
    }
  };


  // ── Database Backup ───────────────────────────────────────────────
  const handleBackupDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      toast.info('Preparing Backup...', { description: 'Generating CSV file from database.' });
      
      const response = await axios.get('http://localhost:5000/api/system/backup', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', 
      }).catch(() => { throw new Error('API Pending'); });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TBF_Database_Backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addAuditLog({ action: 'Database Backup Downloaded', user: currentUser.name, details: 'Full system backup exported' });
      toast.success('Backup Complete', { description: 'File has been downloaded.' });
    } catch (error) {
      toast.error('Backup Failed', { description: 'The backup API route is not built yet.' });
    }
  };

  // If not super admin, block access
  if (currentUser.role !== 'super_admin') {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h3 className="text-xl text-black font-bold">System Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Manage campuses, users, and system configurations</p>
      </div>

      {/* Campus Management */}
      <div className="bg-white border-2 border-black rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-gray-700" />
            <h4 className="font-semibold text-black">Campus Management</h4>
          </div>
          <button onClick={() => setShowAddDialog(true)} className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors">
            <Plus className="size-4" /> Add Campus
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campuses.map(campus => (
              <div key={campus.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-colors group relative">
                <h5 className="font-semibold text-black text-lg">{campus.name}</h5>
                <p className="text-sm text-gray-600 mt-1">{campus.address || 'No address provided'}</p>
                <p className="text-sm text-gray-600">{campus.phone || 'No phone provided'}</p>
                
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <button onClick={() => { setForm(campus); setEditingId(campus.id); setShowEditDialog(true); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"><Edit className="size-4" /></button>
                  <button onClick={() => deleteCampus(campus.id)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-600"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
            {campuses.length === 0 && <p className="text-gray-500 text-sm py-4">No campuses configured yet.</p>}
          </div>
        </div>
      </div>

      {/* Database Backup Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2">
          <Database className="size-5 text-gray-700" />
          <h4 className="font-semibold text-black">Data & Backups</h4>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Export a full copy of your database to a CSV file. This includes all students, staff, attendance, and grades.</p>
          <button onClick={handleBackupDatabase} className="px-4 py-2 border-2 border-black text-black font-medium rounded hover:bg-gray-50 transition-colors text-sm">
            Download Database Backup (.csv)
          </button>
        </div>
      </div>

      {/* Add / Edit Campus Dialogs */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Campus</DialogTitle><DialogDescription>Register a new campus location</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><label className="block text-sm mb-1">Campus Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" placeholder="e.g. North Campus" /></div>
            <div><label className="block text-sm mb-1">Address</label><input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" /></div>
            <div><label className="block text-sm mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => { setShowAddDialog(false); setForm(emptyCampusForm); }} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleAddCampus} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Add Campus</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Campus</DialogTitle><DialogDescription>Update campus information</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><label className="block text-sm mb-1">Campus Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" /></div>
            <div><label className="block text-sm mb-1">Address</label><input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" /></div>
            <div><label className="block text-sm mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button onClick={() => { setShowEditDialog(false); setForm(emptyCampusForm); setEditingId(null); }} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleEditCampus} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">Save Changes</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}