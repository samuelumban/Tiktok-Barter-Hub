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
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    if (user) {
        // Calculate pending approvals for badge
        const count = db.getPendingApprovals(user.id).length;
        setPendingCount(count);

        // Check onboarding status
        const freshUser = db.getUser(user.id);
        if (freshUser && freshUser.hasSeenOnboarding === false) {
            setShowOnboarding(true);
        }
    }
  }, [user, location.pathname]); // Update badge when location changes (user might have approved stuff)

  const handleSkipOnboarding = () => {
      if (user) {
          db.completeOnboarding(user.id);
          setShowOnboarding(false);
      }
  };

  const handleNextOnboarding = () => {
      if (onboardingStep < 4) {
          setOnboardingStep(onboardingStep + 1);
      } else {
          handleSkipOnboarding();
      }
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

  // Onboarding Data
  const steps = [
      { target: 'dashboard', title: 'Dasbor Utama', text: 'Lihat statistik, aset sound, dan riwayat konten Anda di sini.' },
      { target: 'songs', title: 'Sound Saya', text: 'Upload sound Anda agar bisa digunakan oleh kreator lain.' },
      { target: 'tasks', title: 'Tugas Saya', text: 'Ambil tugas membuat konten untuk mendapatkan poin kredit.' },
      { target: 'approvals', title: 'Persetujuan', text: 'Review konten yang dibuat orang lain untuk sound Anda.' },
      { target: 'gallery', title: 'Galeri', text: 'Lihat semua karya komunitas di sini.' }
  ];

  const currentStepData = steps[onboardingStep];

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
                {showOnboarding && onboardingStep === 0 && <OnboardingPulse />}
            </div>

            <div className="relative">
                <Link to="/songs" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/songs')}`}>
                <Music className="mr-3 h-5 w-5" />
                Sound Saya
                </Link>
                {showOnboarding && onboardingStep === 1 && <OnboardingPulse />}
            </div>

            <div className="relative">
                <Link to="/tasks" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tasks')}`}>
                <ListTodo className="mr-3 h-5 w-5" />
                Tugas Saya
                </Link>
                {showOnboarding && onboardingStep === 2 && <OnboardingPulse />}
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
                {showOnboarding && onboardingStep === 3 && <OnboardingPulse />}
            </div>

             <div className="relative">
                <Link to="/gallery" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/gallery')}`}>
                <Globe className="mr-3 h-5 w-5" />
                Galeri Konten
                </Link>
                {showOnboarding && onboardingStep === 4 && <OnboardingPulse />}
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
            onClick={onLogout}
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
          <button onClick={onLogout}><LogOut className="h-5 w-5" /></button>
        </div>

        {/* Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 pb-24 md:pb-6">
            {children}
        </main>

        {/* Onboarding Overlay */}
        {showOnboarding && (
            <div className="fixed left-64 top-20 z-50 bg-white p-6 rounded-lg shadow-2xl border border-indigo-100 max-w-xs animate-fade-in-up">
                <div className="absolute -left-2 top-6 w-4 h-4 bg-white transform rotate-45 border-l border-b border-indigo-100"></div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-indigo-700 text-lg">{currentStepData.title}</h3>
                    <button onClick={handleSkipOnboarding} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4"/></button>
                </div>
                <p className="text-sm text-gray-600 mb-4">{currentStepData.text}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{onboardingStep + 1} dari 5</span>
                    <button 
                        onClick={handleNextOnboarding}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-full font-medium hover:bg-indigo-700"
                    >
                        {onboardingStep === 4 ? 'Selesai' : 'Lanjut'}
                    </button>
                </div>
            </div>
        )}
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

const OnboardingPulse = () => (
    <span className="absolute left-0 top-0 h-full w-full border-2 border-yellow-400 rounded-md animate-pulse pointer-events-none"></span>
);