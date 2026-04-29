import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle, AlertTriangle, BrainCircuit, Activity, ChevronRight } from 'lucide-react';
import { User, Appointment } from '../types';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';

interface DoctorDashboardProps {
  user: User;
}

export default function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await dbService.getDoctorAppointments(user.id);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await dbService.updateAppointmentStatus(id, status);
    fetchAppointments();
  };

  const stats = {
    total: appointments.length,
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    highRisk: appointments.filter(a => a.noShowProbability > 0.5).length
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Appointments" 
          value={stats.total} 
          icon={<Calendar className="w-6 h-6 text-blue-600" />} 
          color="blue"
        />
        <StatCard 
          title="Today's Patients" 
          value={stats.today} 
          icon={<Clock className="w-6 h-6 text-indigo-600" />} 
          color="indigo"
        />
        <StatCard 
          title="High No-Show Risk" 
          value={stats.highRisk} 
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
          color="red"
          subtitle="Patients with >50% probability"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Patient Queue
          </h3>
          <div className="flex gap-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase">All</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase">Confirmed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Patient Details</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Predictive Insights</th>
                <th className="px-6 py-4">Symptoms</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No appointments found in your queue.
                  </td>
                </tr>
              ) : (
                appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                          <p className="text-xs text-slate-500">{apt.patientAge} years old</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">{apt.date}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {apt.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                apt.noShowProbability > 0.5 ? "bg-red-500" : "bg-green-500"
                              )}
                              style={{ width: `${apt.noShowProbability * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">
                            {(apt.noShowProbability * 100).toFixed(0)}% Risk
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" />
                          Est. Wait: {apt.predictedWaitingTime}m
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-[200px]">
                        {apt.symptoms}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(apt.id, 'completed')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Cancel Appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: number; icon: React.ReactNode; color: string; subtitle?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-600 shadow-blue-100",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-indigo-100",
    red: "bg-red-50 border-red-100 text-red-600 shadow-red-100",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn("p-6 rounded-3xl border shadow-sm", colors[color])}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {icon}
        </div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
      </div>
      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      {subtitle && <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
