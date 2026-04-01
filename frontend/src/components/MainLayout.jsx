import { useState } from 'react';
import {
  LayoutDashboard, Users, ClipboardCheck, FileText,
  UserCog, BookOpen, FileBarChart, UserCheck,
  Settings, ChevronDown, Menu, X,
} from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useUser } from './UserContext.jsx';
import { ProfileSwitcher } from './ProfileSwitcher.jsx';
import { Dashboard } from './Dashboard.jsx';
import { StudentDirectory } from './StudentDirectory.jsx';
import { DailyAttendance } from './DailyAttendance.jsx';
import { ExamResults } from './ExamResults.jsx';
import { StaffHR } from './StaffHR.jsx';
import { Syllabus } from './Syllabus.jsx';
import { AuditLogs } from './AuditLogs.jsx';
import { AdminSettings } from './AdminSettings.jsx';
import { SuperAdminDashboard } from './SuperAdminDashboard.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',            icon: LayoutDashboard, roles: ['teacher', 'admin', 'super_admin'] },
  { id: 'students',   label: 'Student Records',       icon: Users,           roles: ['admin', 'super_admin'] },
  { id: 'attendance', label: 'Attendance',            icon: ClipboardCheck,  roles: ['teacher', 'admin', 'super_admin'] },
  { id: 'exams',      label: 'Exams & Results',       icon: FileText,        roles: ['admin', 'super_admin'] },
  { id: 'staff',      label: 'Staff / HR',            icon: UserCog,         roles: ['admin', 'super_admin'] },
  { id: 'syllabus',   label: 'Syllabus',              icon: BookOpen,        roles: ['teacher', 'admin', 'super_admin'] },
  { id: 'audit',      label: 'Audit Logs',            icon: FileBarChart,    roles: ['super_admin'] },
  { id: 'superadmin', label: 'Registration Requests', icon: UserCheck,       roles: ['super_admin'] },
  { id: 'settings',   label: 'Settings',              icon: Settings,        roles: ['teacher', 'admin', 'super_admin'] },
];

export default function MainLayout() {
  const { currentUser } = useUser();
  const { campuses, selectedCampus, setSelectedCampus } = useCampus();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(currentUser.role));

  const availableCampuses =
    currentUser.campus === 'Both'
      ? campuses
      : campuses.filter((c) => c.name === currentUser.campus);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        style={{ backgroundColor: '#000000', color: '#ffffff' }}
        className={`w-64 flex flex-col fixed h-full z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div style={{ borderBottom: '1px solid #1f2937', padding: '24px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>The Bridge Foundation</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>School Management System</p>
        </div>

        <nav style={{ flex: 1, paddingTop: '24px', paddingBottom: '24px', overflowY: 'auto' }}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveScreen(item.id); setIsMobileMenuOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  textAlign: 'left',
                  backgroundColor: isActive ? '#dc2626' : 'transparent',
                  color: isActive ? '#ffffff' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#111827'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #1f2937', padding: '24px' }}>
          <p style={{ color: '#ffffff', fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px', textTransform: 'capitalize' }}>{currentUser.role.replace('_', ' ')}</p>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '16px' }}>© 2026 The Bridge Foundation</p>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="size-6 text-black" /> : <Menu className="size-6 text-black" />}
            </button>
            <div className="min-w-0">
              <h2 className="text-lg lg:text-2xl text-black truncate">
                {NAV_ITEMS.find((n) => n.id === activeScreen)?.label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Manage your school operations efficiently
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Campus switcher */}
            <div className="relative">
              <button
                onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 bg-white border-2 border-black rounded-lg hover:bg-red-50 transition-colors"
              >
                <span className="text-xs lg:text-sm text-black truncate max-w-[80px] lg:max-w-none">
                  {selectedCampus}
                </span>
                <ChevronDown className={`size-3 lg:size-4 text-black transition-transform flex-shrink-0 ${isCampusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCampusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCampusDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-40 lg:w-48 bg-white border-2 border-black rounded-lg shadow-xl z-20 overflow-hidden">
                    {availableCampuses.map((campus) => (
                      <button
                        key={campus.name}
                        onClick={() => { setSelectedCampus(campus.name); setIsCampusDropdownOpen(false); }}
                        className={`w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm transition-colors ${
                          selectedCampus === campus.name
                            ? 'bg-red-600 text-white'
                            : 'text-black hover:bg-gray-100'
                        }`}
                      >
                        {campus.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Profile Switcher */}
            <ProfileSwitcher />
          </div>
        </header>

        {/* Screen content */}
        <main className="p-4 lg:p-8">
          {activeScreen === 'dashboard'  && <Dashboard onNavigateToStudents={() => setActiveScreen('students')} />}
          {activeScreen === 'students'   && <StudentDirectory />}
          {activeScreen === 'attendance' && <DailyAttendance />}
          {activeScreen === 'exams'      && <ExamResults />}
          {activeScreen === 'staff'      && <StaffHR />}
          {activeScreen === 'syllabus'   && <Syllabus />}
          {activeScreen === 'audit'      && <AuditLogs />}
          {activeScreen === 'superadmin' && <SuperAdminDashboard />}
          {activeScreen === 'settings'   && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}