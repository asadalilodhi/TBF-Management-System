import { useState } from 'react';
import { Search, Filter, FileBarChart, Download } from 'lucide-react';
import { useAuditLog } from './AuditLogContext.jsx';

function getActionBadge(action) {
  if (action.includes('Login') || action.includes('Access')) return 'bg-blue-100 text-blue-800';
  if (action.includes('Added') || action.includes('Created')) return 'bg-green-100 text-green-800';
  if (action.includes('Updated') || action.includes('Modified')) return 'bg-yellow-100 text-yellow-800';
  if (action.includes('Deleted') || action.includes('Removed')) return 'bg-red-100 text-red-800';
  if (action.includes('Attendance')) return 'bg-purple-100 text-purple-800';
  if (action.includes('Exam') || action.includes('Results')) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

export function AuditLogs() {
  const { auditLogs } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterUser, setFilterUser] = useState('All');

  const actions = ['All', ...Array.from(new Set(auditLogs.map((l) => l.action)))];
  const users = ['All', ...Array.from(new Set(auditLogs.map((l) => l.user)))];

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesUser = filterUser === 'All' || log.user === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Action', 'User', 'Timestamp', 'Details'];
    const csv = [
      headers.join(','),
      ...filteredLogs.map((l) => [l.id, l.action, l.user, l.timestamp, `"${l.details}"`].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: 'Total Logs', value: filteredLogs.length, color: 'bg-red-600' },
    { label: "Today's Activity", value: filteredLogs.filter((l) => l.timestamp.includes('01-30')).length, color: 'bg-green-600' },
    { label: 'Unique Users', value: users.length - 1, color: 'bg-purple-600' },
    { label: 'Action Types', value: actions.length - 1, color: 'bg-black' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-black">Audit Logs</h3>
          <p className="text-sm text-gray-500 mt-1">Track all system activities and changes</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${s.color} rounded-lg`}>
                <FileBarChart className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">{s.label}</p>
                <p className="text-xl text-black">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm appearance-none"
            >
              {actions.map((a) => (
                <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>
              ))}
            </select>
          </div>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
          >
            {users.map((u) => (
              <option key={u} value={u}>{u === 'All' ? 'All Users' : u}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-600">Showing {filteredLogs.length} log entries</p>

      {/* Table */}
      <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-black text-white">
              <tr>
                {['Log ID', 'Action', 'User', 'Timestamp', 'Details'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{log.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg text-black mb-4">Recent Activity Timeline</h4>
        <div className="space-y-4">
          {filteredLogs.slice(0, 5).map((log, index) => (
            <div key={log.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`size-3 rounded-full ${index === 0 ? 'bg-red-600' : index === 1 ? 'bg-black' : 'bg-gray-400'}`} />
                {index < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs rounded ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
                <p className="text-sm text-black mt-1">{log.user}</p>
                <p className="text-sm text-gray-600 mt-1">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}