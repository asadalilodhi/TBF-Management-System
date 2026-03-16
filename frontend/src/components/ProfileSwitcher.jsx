import { useState } from 'react';
import { User as UserIcon, ChevronDown } from 'lucide-react';
import { useUser, mockUsers } from './UserContext.jsx';

const roleColors = {
  super_admin: 'bg-red-600 text-white',
  admin: 'bg-black text-white',
  teacher: 'bg-gray-600 text-white',
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  teacher: 'Teacher',
};

export function ProfileSwitcher() {
  const { currentUser, setCurrentUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-red-600 transition-colors"
      >
        <div className="size-8 lg:size-9 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <UserIcon className="size-4 lg:size-5 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm text-black">{currentUser.name}</div>
          <div className="text-xs text-gray-500">{roleLabels[currentUser.role]}</div>
        </div>
        <ChevronDown
          className={`size-3 lg:size-4 text-gray-600 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 lg:w-72 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2 lg:p-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Switch Profile</div>
            </div>
            <div className="max-h-60 lg:max-h-80 overflow-y-auto">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-left hover:bg-red-50 transition-colors ${
                    currentUser.id === user.id ? 'bg-red-100' : ''
                  }`}
                >
                  <div
                    className={`size-9 lg:size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentUser.id === user.id ? 'bg-red-600' : 'bg-gray-400'
                    }`}
                  >
                    <UserIcon className="size-4 lg:size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-black truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                      roleColors[user.role] || roleColors.teacher
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}