import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Music, CheckSquare, ListTodo, LogOut, ShieldAlert } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
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
            <Link to="/" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dasbor
            </Link>
            <Link to="/songs" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/songs')}`}>
              <Music className="mr-3 h-5 w-5" />
              Lagu Saya
            </Link>
            <Link to="/tasks" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tasks')}`}>
              <ListTodo className="mr-3 h-5 w-5" />
              Tugas Saya
            </Link>
            <Link to="/approvals" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/approvals')}`}>
              <CheckSquare className="mr-3 h-5 w-5" />
              Persetujuan
            </Link>
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
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-gray-900 flex items-center justify-between px-4 text-white">
          <span className="font-bold">Barter Hub</span>
          <button onClick={onLogout}><LogOut className="h-5 w-5" /></button>
        </div>

        {/* Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
        </main>
      </div>
      
      {/* Mobile Nav Bottom */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-3 z-50">
        <Link to="/" className="text-gray-600"><LayoutDashboard className="h-6 w-6" /></Link>
        <Link to="/songs" className="text-gray-600"><Music className="h-6 w-6" /></Link>
        <Link to="/tasks" className="text-gray-600"><ListTodo className="h-6 w-6" /></Link>
        <Link to="/approvals" className="text-gray-600"><CheckSquare className="h-6 w-6" /></Link>
      </div>
    </div>
  );
};