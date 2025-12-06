import { useState, useEffect } from 'react';

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  description: string;
}

const defaultSettings: ClinicSettings = {
  clinicName: 'Smile Dental Clinic',
  address: '123 Health Street, Medical District',
  phone: '+1 234 567 8900',
  email: 'info@smiledental.com',
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  description: 'A modern dental clinic providing comprehensive oral healthcare services.'
};

const STORAGE_KEY = 'clinic-settings';

export const useClinicSettings = () => {
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
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

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { settings, updateSettings };
};
