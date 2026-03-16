import { useState } from 'react';
import { useRegistration } from './RegistrationContext.jsx';
import {
  CheckCircle, XCircle, UserCheck, ShieldAlert,
  School, GraduationCap, Users, Clock,
} from 'lucide-react';
import { useToast } from './ui/toast.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.jsx';
import { Badge } from './ui/badge.jsx';

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function SuperAdminDashboard() {
  const { registrationRequests, approveRequest, rejectRequest } = useRegistration();
  const toast = useToast();

  const pending  = registrationRequests.filter((r) => r.status === 'pending');
  const approved = registrationRequests.filter((r) => r.status === 'approved');
  const rejected = registrationRequests.filter((r) => r.status === 'rejected');

  const handleApprove = (id, name) => {
    approveRequest(id);
    toast.success(`Approved registration for ${name}`, {
      description: 'User has been granted access to the system.',
    });
  };

  const handleReject = (id, name) => {
    rejectRequest(id, 'Application does not meet requirements');
    toast.error(`Rejected registration for ${name}`, {
      description: 'User has been notified of the decision.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg text-black">Registration Management</h3>
        <p className="text-sm text-gray-500 mt-1">Review and approve new user registration requests</p>
      </div>

      {/* Role guide */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="size-5 text-red-600" />
          <h4 className="text-black font-semibold">Role Authorization Guide</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Users className="size-4 text-white" />
              </div>
              <span className="font-semibold text-black">Admin</span>
            </div>
            <p className="text-sm text-gray-600 pl-10">
              <strong>Full Access:</strong> Exam/Result addition, Student Records management, Staff/HR management.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <GraduationCap className="size-4 text-white" />
              </div>
              <span className="font-semibold text-black">Teacher</span>
            </div>
            <p className="text-sm text-gray-600 pl-10">
              <strong>Limited Access:</strong> Daily Attendance marking and viewing Performance Screens only.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <UserCheck className="size-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-black mb-2">No Pending Requests</h4>
              <p className="text-sm text-gray-500">All registration requests have been processed.</p>
            </div>
          ) : pending.map((req) => (
            <div key={req.id} className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-black font-semibold">{req.name}</h4>
                    <Badge className={req.role === 'admin' ? 'bg-red-600 text-white' : 'bg-black text-white'}>
                      {req.role.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <School className="size-3" /> {req.campus}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{req.email}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="size-3" /> Requested on {formatDate(req.requestedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(req.id, req.name)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm cursor-pointer"
                  >
                    <XCircle className="size-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req.id, req.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                  >
                    <CheckCircle className="size-4" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <UserCheck className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No approved requests yet.</p>
            </div>
          ) : approved.map((req) => (
            <div key={req.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-black font-semibold">{req.name}</h4>
                    <Badge className="bg-green-600 text-white">APPROVED</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{req.email}</p>
                  <p className="text-xs text-gray-500">{req.role === 'admin' ? 'Admin' : 'Teacher'} • {req.campus}</p>
                </div>
                <CheckCircle className="size-6 text-green-600" />
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected" className="space-y-4">
          {rejected.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <XCircle className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No rejected requests.</p>
            </div>
          ) : rejected.map((req) => (
            <div key={req.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-black font-semibold">{req.name}</h4>
                    <Badge variant="outline">REJECTED</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{req.email}</p>
                  {req.notes && <p className="text-xs text-gray-500 italic">Reason: {req.notes}</p>}
                </div>
                <XCircle className="size-6 text-gray-400" />
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}