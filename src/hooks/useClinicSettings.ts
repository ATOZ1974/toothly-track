import { useState, useEffect } from 'react';

export interface DayHours {
  isOpen: boolean;
  start: string;
  end: string;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface AppointmentType {
  id: string;
  name: string;
  defaultDuration: number; // in minutes
  color: string;
}

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  weeklyHours: WeeklyHours;
  appointmentTypes: AppointmentType[];
  description: string;
}

const defaultWeeklyHours: WeeklyHours = {
  monday: { isOpen: true, start: '09:00', end: '18:00' },
  tuesday: { isOpen: true, start: '09:00', end: '18:00' },
  wednesday: { isOpen: true, start: '09:00', end: '18:00' },
  thursday: { isOpen: true, start: '09:00', end: '18:00' },
  friday: { isOpen: true, start: '09:00', end: '18:00' },
  saturday: { isOpen: true, start: '09:00', end: '14:00' },
  sunday: { isOpen: false, start: '09:00', end: '14:00' },
};

const defaultAppointmentTypes: AppointmentType[] = [
  { id: 'checkup', name: 'Checkup', defaultDuration: 30, color: 'hsl(var(--primary))' },
  { id: 'cleaning', name: 'Cleaning', defaultDuration: 45, color: 'hsl(142, 76%, 36%)' },
  { id: 'extraction', name: 'Extraction', defaultDuration: 60, color: 'hsl(0, 84%, 60%)' },
  { id: 'filling', name: 'Filling', defaultDuration: 45, color: 'hsl(38, 92%, 50%)' },
  { id: 'root-canal', name: 'Root Canal', defaultDuration: 90, color: 'hsl(262, 83%, 58%)' },
  { id: 'consultation', name: 'Consultation', defaultDuration: 15, color: 'hsl(199, 89%, 48%)' },
];

const defaultSettings: ClinicSettings = {
  clinicName: 'Smile Dental Clinic',
  address: '123 Health Street, Medical District',
  phone: '+1 234 567 8900',
  email: 'info@smiledental.com',
  weeklyHours: defaultWeeklyHours,
  appointmentTypes: defaultAppointmentTypes,
  description: 'A modern dental clinic providing comprehensive oral healthcare services.'
};

const STORAGE_KEY = 'clinic-settings';

// Helper to get working hours for a specific day
export const getDayKey = (date: Date): keyof WeeklyHours => {
  const days: (keyof WeeklyHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const useClinicSettings = () => {
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { 
          ...defaultSettings, 
          ...parsed,
          weeklyHours: { ...defaultWeeklyHours, ...parsed.weeklyHours },
          appointmentTypes: parsed.appointmentTypes?.length > 0 ? parsed.appointmentTypes : defaultAppointmentTypes
        };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateDayHours = (day: keyof WeeklyHours, hours: Partial<DayHours>) => {
    const updatedWeeklyHours = {
      ...settings.weeklyHours,
      [day]: { ...settings.weeklyHours[day], ...hours }
    };
    updateSettings({ weeklyHours: updatedWeeklyHours });
  };

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings({ 
            ...defaultSettings, 
            ...parsed,
            weeklyHours: { ...defaultWeeklyHours, ...parsed.weeklyHours },
            appointmentTypes: parsed.appointmentTypes?.length > 0 ? parsed.appointmentTypes : defaultAppointmentTypes
          });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { settings, updateSettings, updateDayHours };
};
