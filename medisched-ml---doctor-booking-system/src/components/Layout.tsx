import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Calendar, Activity, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold tracking-tight text-slate-900">MediSched ML</span>
            </div>
            
            {user && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold">
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
