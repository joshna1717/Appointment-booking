import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, Calendar, TrendingUp, Activity, PieChart, BarChart3, ChevronRight, UserPlus, FileText } from 'lucide-react';
import { User, Analytics } from '../types';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await dbService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) return <div className="p-12 text-center text-slate-400">Loading analytics...</div>;

  return (
    <div className="space-y-10">
      {/* Admin Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration</h2>
            <p className="text-slate-500 text-sm">Real-time health system monitoring and oversight</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Doctor
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <FileText className="w-4 h-4" />
            Reports
          </button>
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Bookings" value={analytics.total} icon={<Calendar className="w-5 h-5" />} color="blue" />
        <MetricCard title="Completed" value={analytics.completed} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        <MetricCard title="Cancelled" value={analytics.cancelled} icon={<Activity className="w-5 h-5" />} color="red" />
        <MetricCard title="Active Doctors" value={2} icon={<Users className="w-5 h-5" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Popular Specializations */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Popular Specializations
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase">Last 30 Days</span>
          </div>
          
          <div className="space-y-6">
            {analytics.popular.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-700">
                  <span>{item.specialization}</span>
                  <span>{item.count} Bookings</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / analytics.total) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Booking Distribution
          </h3>
          
          <div className="flex items-center justify-center py-10">
            <div className="relative w-48 h-48">
              {/* Simple CSS Pie Chart Simulation */}
              <div className="absolute inset-0 rounded-full border-[16px] border-slate-100" />
              <div 
                className="absolute inset-0 rounded-full border-[16px] border-green-500" 
                style={{ clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-slate-900">{((analytics.completed / analytics.total) * 100).toFixed(0)}%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Success Rate</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-slate-600 font-medium">Completed Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-100 rounded-full" />
              <span className="text-xs text-slate-600 font-medium">Other Statuses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
