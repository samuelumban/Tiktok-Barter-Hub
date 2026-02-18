import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Music, CheckSquare, ListTodo, LogOut, ShieldAlert, Globe, X } from 'lucide-react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDb';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
        // Calculate pending approvals for badge
        const count = db.getPendingApprovals(user.id).length;
        setPendingCount(count);
    }
  }, [user, location.pathname]); // Update badge when location changes (user might have approved stuff)

  const handleLogout = () => {
      db.clearSession();
      onLogout();
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">{children}</div>;
  }

  // Active state logic - ensured contrast
  const isActive = (path: string) => location.pathname === path 
    ? "bg-indigo-600 text-white shadow-lg" 
    : "text-gray-300 hover:bg-gray-800 hover:text-white";

  const isMobileActive = (path: string) => location.pathname === path 
    ? "text-indigo-600" 
    : "text-gray-400";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            TikTok Barter
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-6">
             <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Menu</p>
          </div>
          <nav className="px-3 space-y-1">
            <div className="relative">
                <Link to="/" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dasbor
                </Link>
            </div>

            <div className="relative">
                <Link to="/songs" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/songs')}`}>
                <Music className="mr-3 h-5 w-5" />
                Sound Saya
                </Link>
            </div>

            <div className="relative">
                <Link to="/tasks" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tasks')}`}>
                <ListTodo className="mr-3 h-5 w-5" />
                Tugas Saya
                </Link>
            </div>

            <div className="relative">
                <Link to="/approvals" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors justify-between ${isActive('/approvals')}`}>
                    <div className="flex items-center">
                        <CheckSquare className="mr-3 h-5 w-5" />
                        Persetujuan
                    </div>
                    {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                </Link>
            </div>

             <div className="relative">
                <Link to="/gallery" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/gallery')}`}>
                <Globe className="mr-3 h-5 w-5" />
                Galeri Konten
                </Link>
             </div>

            {user.role === UserRole.ADMIN && (
               <Link to="/admin" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')}`}>
               <ShieldAlert className="mr-3 h-5 w-5 text-red-400" />
               Panel Admin
             </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">
              {user.userCode.substring(0,2)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">Kreator {user.tier}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-gray-900 flex items-center justify-between px-4 text-white">
          <span className="font-bold">Barter Hub</span>
          <button onClick={handleLogout}><LogOut className="h-5 w-5" /></button>
        </div>

        {/* Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 pb-24 md:pb-6">
            {children}
        </main>
      </div>
      
      {/* Mobile Nav Bottom */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-between items-center px-6 py-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link to="/" className={`flex flex-col items-center justify-center ${isMobileActive('/')}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Dasbor</span>
        </Link>
        <Link to="/songs" className={`flex flex-col items-center justify-center ${isMobileActive('/songs')}`}>
            <Music className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Sound</span>
        </Link>
        <Link to="/tasks" className={`flex flex-col items-center justify-center ${isMobileActive('/tasks')}`}>
            <ListTodo className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Tugas</span>
        </Link>
        <div className="relative">
            <Link to="/approvals" className={`flex flex-col items-center justify-center ${isMobileActive('/approvals')}`}>
                <CheckSquare className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium">Review</span>
            </Link>
            {pendingCount > 0 && (
                <span className="absolute top-0 right-1 bg-red-500 text-[9px] text-white h-4 w-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {pendingCount}
                </span>
            )}
        </div>
        <Link to="/gallery" className={`flex flex-col items-center justify-center ${isMobileActive('/gallery')}`}>
            <Globe className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Galeri</span>
        </Link>
      </div>
    </div>
  );
};