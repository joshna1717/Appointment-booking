import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, Clock, Calendar, AlertCircle, ChevronRight, Sparkles, BrainCircuit, History, X, Activity } from 'lucide-react';
import { User, Doctor, Appointment } from '../types';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';

interface PatientDashboardProps {
  user: User;
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSymptoms, setBookingSymptoms] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ noShow: number; waitTime: number } | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    const data = await dbService.getDoctors();
    setDoctors(data);
  };

  const fetchAppointments = async () => {
    const data = await dbService.getPatientAppointments(user.id);
    setAppointments(data);
  };

  const handleRecommend = async () => {
    if (!symptoms.trim()) return;
    setIsRecommending(true);
    try {
      const data = await dbService.recommendDoctors(symptoms);
      setRecommendedDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setIsBooking(true);
    try {
      const data = await dbService.createAppointment({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        date: bookingDate,
        time: bookingTime,
        symptoms: bookingSymptoms
      });
      setBookingResult({ noShow: data.noShowProbability, waitTime: data.predictedWaitingTime });
      fetchAppointments();
      setTimeout(() => {
        setSelectedDoctor(null);
        setBookingResult(null);
        setBookingDate('');
        setBookingTime('');
        setBookingSymptoms('');
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Hero / Recommendation Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200 overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">How are you feeling today?</h2>
          <p className="text-blue-100 mb-6 font-medium">Describe your symptoms and our system will recommend the best specialist for you.</p>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input 
                type="text" 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. I have a persistent headache and dizziness..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
            <button 
              onClick={handleRecommend}
              disabled={isRecommending || !symptoms.trim()}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isRecommending ? 'Analyzing...' : 'Get Recommendation'}
              <BrainCircuit className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </section>

      {/* Recommended Doctors */}
      <AnimatePresence>
        {recommendedDoctors.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-sm">
              <Sparkles className="w-4 h-4" />
              Recommended Specialists
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedDoctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onBook={() => setSelectedDoctor(doc)} isRecommended />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Doctor Search & List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Find a Doctor
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDoctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} onBook={() => setSelectedDoctor(doc)} />
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            My Appointments
          </h3>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No upcoming appointments</p>
              </div>
            ) : (
              appointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Book Appointment</h4>
                    <p className="text-sm text-slate-500">with {selectedDoctor.name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8">
                {bookingResult ? (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h5 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h5>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Predicted Wait Time</p>
                        <p className="text-2xl font-bold text-blue-900">{bookingResult.waitTime} mins</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <p className="text-xs text-indigo-600 font-bold uppercase mb-1">No-Show Probability</p>
                        <p className="text-2xl font-bold text-indigo-900">{(bookingResult.noShow * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">Our ML models have analyzed your booking details.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                        <input 
                          type="date" 
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
                        <input 
                          type="time" 
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit / Symptoms</label>
                      <textarea 
                        required
                        rows={3}
                        value={bookingSymptoms}
                        onChange={(e) => setBookingSymptoms(e.target.value)}
                        placeholder="Briefly describe your health concern..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                      <BrainCircuit className="w-6 h-6 text-blue-600 shrink-0" />
                      <p className="text-sm text-blue-800">
                        Our recommendation engine will predict your waiting time and no-show probability upon booking to help us optimize clinic flow.
                      </p>
                    </div>

                    <button 
                      type="submit"
                      disabled={isBooking}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {isBooking ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DoctorCard: React.FC<{ doctor: Doctor; onBook: () => void; isRecommended?: boolean }> = ({ doctor, onBook, isRecommended }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white rounded-2xl p-6 border transition-all shadow-sm",
        isRecommended ? "border-blue-200 ring-2 ring-blue-100" : "border-slate-100"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
          <Activity className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {doctor.rating}
        </div>
      </div>
      
      <h4 className="font-bold text-slate-900 text-lg">{doctor.name}</h4>
      <p className="text-blue-600 text-sm font-bold mb-3">{doctor.specialization}</p>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <MapPin className="w-3 h-3" />
          {doctor.hospital}, {doctor.location}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Clock className="w-3 h-3" />
          {doctor.experience} Years Experience
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-xs text-slate-400 font-medium">Consultation Fee</p>
          <p className="text-lg font-bold text-slate-900">${doctor.fees}</p>
        </div>
        <button 
          onClick={onBook}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1"
        >
          Book Now
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const isPast = new Date(appointment.date) < new Date();
  
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-sm">{appointment.doctorName}</h5>
            <p className="text-xs text-slate-500">{appointment.specialization}</p>
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
          appointment.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
        )}>
          {appointment.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
          <p className="text-xs font-bold text-slate-700">{appointment.date}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
          <p className="text-xs font-bold text-slate-700">{appointment.time}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Wait: {appointment.predictedWaitingTime}m
        </div>
        <div className="flex items-center gap-1">
          <BrainCircuit className="w-3 h-3" />
          No-Show: {(appointment.noShowProbability * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
