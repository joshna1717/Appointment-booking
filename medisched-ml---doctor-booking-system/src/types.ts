export interface User {
  id: number;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  password?: string;
}

export interface Doctor {
  id: number;
  userId: number;
  name: string;
  specialization: string;
  hospital: string;
  location: string;
  experience: number;
  fees: number;
  rating: number;
  bio: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  noShowProbability: number;
  predictedWaitingTime: number;
  doctorName?: string;
  patientName?: string;
  patientAge?: number;
  specialization?: string;
}

export interface Analytics {
  total: number;
  completed: number;
  cancelled: number;
  popular: { specialization: string; count: number }[];
}
