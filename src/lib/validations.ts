import { z } from 'zod';

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Name too long')
    .trim(),
  practiceName: z.string()
    .max(200, 'Practice name too long')
    .trim()
    .optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Patient validation schemas
export const patientSchema = z.object({
  name: z.string()
    .min(1, 'Patient name is required')
    .max(200, 'Name too long')
    .trim(),
  age: z.number()
    .int('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(150, 'Invalid age')
    .nullable()
    .optional(),
  dob: z.string().optional(),
  phone: z.string()
    .max(20, 'Phone number too long')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 
      'Invalid phone number format')
    .trim()
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Payment validation schemas
export const paymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount too large')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  method: z.enum(['cash', 'card', 'upi', 'insurance', 'other'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  paidAt: z.string().min(1, 'Payment date is required'),
  notes: z.string()
    .max(500, 'Notes too long')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Clinical notes validation schemas
export const clinicalNotesSchema = z.object({
  chiefComplaint: z.string()
    .max(5000, 'Chief complaint too long (max 5000 characters)')
    .trim()
    .optional()
    .or(z.literal('')),
  clinicalNotes: z.string()
    .max(10000, 'Clinical notes too long (max 10000 characters)')
    .trim()
    .optional()
    .or(z.literal('')),
  treatmentNotes: z.string()
    .max(10000, 'Treatment notes too long (max 10000 characters)')
    .trim()
    .optional()
    .or(z.literal('')),
});

// File validation
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  return { valid: true };
};
