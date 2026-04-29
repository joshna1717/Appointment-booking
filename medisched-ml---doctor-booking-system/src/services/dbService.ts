import { User, Doctor, Appointment, Analytics } from '../types';

const USERS_KEY = 'medisched_users_db';
const DOCTORS_KEY = 'medisched_doctors_db';
const APPOINTMENTS_KEY = 'medisched_appointments_db';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  { id: 1, email: 'admin@medisched.com', password: 'admin123', name: 'System Admin', role: 'admin', age: 35 },
  { id: 2, email: 'dr.smith@medisched.com', password: 'doc123', name: 'Dr. John Smith', role: 'doctor', age: 45 },
  { id: 3, email: 'dr.jane@medisched.com', password: 'doc123', name: 'Dr. Jane Doe', role: 'doctor', age: 38 },
  { id: 4, email: 'patient@test.com', password: 'patient123', name: 'Alice Johnson', role: 'patient', age: 28 },
];

const INITIAL_DOCTORS: Doctor[] = [
  { 
    id: 1, 
    userId: 2, 
    name: 'Dr. John Smith',
    specialization: 'Cardiology', 
    hospital: 'City Heart Center', 
    location: 'Downtown', 
    experience: 15, 
    fees: 150, 
    rating: 4.8, 
    bio: 'Specialist in cardiovascular diseases.' 
  },
  { 
    id: 2, 
    userId: 3, 
    name: 'Dr. Jane Doe',
    specialization: 'Pediatrics', 
    hospital: 'Kids Care Clinic', 
    location: 'Uptown', 
    experience: 10, 
    fees: 100, 
    rating: 4.9, 
    bio: 'Dedicated to child health and wellness.' 
  },
];

class DBService {
  private init() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(DOCTORS_KEY)) {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(INITIAL_DOCTORS));
    }
    if (!localStorage.getItem(APPOINTMENTS_KEY)) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([]));
    }
  }

  private getData<T>(key: string): T[] {
    this.init();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth
  async login(email: string, password: string): Promise<User | null> {
    const users = this.getData<User & { password?: string }>(USERS_KEY);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  }

  async register(data: any): Promise<User> {
    const users = this.getData<User>(USERS_KEY);
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already exists');
    }
    const newUser: User = {
      ...data,
      id: Date.now(),
      role: data.role || 'patient'
    };
    users.push(newUser);
    this.setData(USERS_KEY, users);
    return newUser;
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    return this.getData<Doctor>(DOCTORS_KEY);
  }

  // Appointments
  async createAppointment(data: any): Promise<any> {
    const appointments = this.getData<Appointment>(APPOINTMENTS_KEY);
    const doctors = this.getData<Doctor>(DOCTORS_KEY);
    const doctor = doctors.find(d => d.id === data.doctorId);

    // Predict waiting time (Simulated Logic)
    const doctorAppointments = appointments.filter(a => a.doctorId === data.doctorId && a.date === data.date);
    const waitingTime = 5 + (doctorAppointments.length * 20);
    
    // Predict no-show (Simulated Logic)
    const prob = Math.random() * 0.3;

    const newApt: Appointment = {
      ...data,
      id: Date.now(),
      status: 'confirmed',
      noShowProbability: parseFloat(prob.toFixed(2)),
      predictedWaitingTime: waitingTime,
      doctorName: doctor?.name,
      specialization: doctor?.specialization
    };

    appointments.push(newApt);
    this.setData(APPOINTMENTS_KEY, appointments);
    return newApt;
  }

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    const appointments = this.getData<Appointment>(APPOINTMENTS_KEY);
    return appointments.filter(a => a.patientId === patientId).sort((a, b) => b.id - a.id);
  }

  async getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
    const appointments = this.getData<Appointment>(APPOINTMENTS_KEY);
    const users = this.getData<User>(USERS_KEY);
    
    return appointments
      .filter(a => a.doctorId === doctorId)
      .map(a => {
        const patient = users.find(u => u.id === a.patientId);
        return {
          ...a,
          patientName: patient?.name,
          patientAge: patient?.age
        };
      })
      .sort((a, b) => b.id - a.id);
  }

  async updateAppointmentStatus(id: number, status: string) {
    const appointments = this.getData<Appointment>(APPOINTMENTS_KEY);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index].status = status as any;
      this.setData(APPOINTMENTS_KEY, appointments);
    }
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const appointments = this.getData<Appointment>(APPOINTMENTS_KEY);
    const doctors = this.getData<Doctor>(DOCTORS_KEY);
    
    const popular: Record<string, number> = {};
    appointments.forEach(a => {
      const doc = doctors.find(d => d.id === a.doctorId);
      if (doc) {
        popular[doc.specialization] = (popular[doc.specialization] || 0) + 1;
      }
    });

    return {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      popular: Object.entries(popular).map(([specialization, count]) => ({ specialization, count }))
    };
  }

  // Mock recommendation
  async recommendDoctors(symptoms: string): Promise<Doctor[]> {
    const doctors = await this.getDoctors();
    const query = symptoms.toLowerCase();
    
    return doctors
      .map(doc => {
        let score = 0;
        const text = `${doc.specialization} ${doc.bio} ${doc.name}`.toLowerCase();
        if (query.includes(doc.specialization.toLowerCase())) score += 5;
        const keywords = query.split(/\s+/).filter(k => k.length > 2);
        keywords.forEach(k => { if (text.includes(k)) score += 1; });
        return { doc, score };
      })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(i => i.doc)
      .slice(0, 3);
  }
}

export const dbService = new DBService();
