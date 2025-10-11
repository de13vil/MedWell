import React from 'react';
import { Bell, Search, LogOut } from 'lucide-react';

const Topbar = ({ user, onLogout }) => (
    <div className="h-16 glass-card flex items-center justify-between px-6">
        <div className="flex items-center">
             <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search for medicines, schedules..."
                    className="w-full bg-transparent border border-transparent rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus-accent"
                />
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
                <Bell size={22} />
            </button>
            <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md flex items-center justify-center">
                    {user?.photo ? (
                        <img className="h-full w-full object-cover" src={`${user.photo.startsWith('/uploads') ? user.photo : `/uploads${user.photo}`}`} alt="User" onError={(e)=>{e.target.onerror=null; e.target.src=`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`;}} />
                    ) : (
                        <img className="h-full w-full object-cover" src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} alt="User" />
                    )}
                </div>
                <div>
                     <span className="text-white font-medium">{user?.name}</span>
                     <p className="text-xs text-gray-400">Patient</p>
                </div>
            </div>
             <button onClick={onLogout} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
                <LogOut size={22} />
            </button>
        </div>
    </div>
);

export default Topbar;
