import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const ADMIN_ROLES    = new Set(['admin', 'administrator', 'schooladmin', 'superadmin', 'itadmin', 'sysadmin', 'quanly']);
const LECTURER_ROLES = new Set(['lecturer', 'faculty', 'staff', 'teacher', 'giangvien', 'gv', 'instructor', 'professor']);
const STUDENT_ROLES  = new Set(['student', 'sinhvien', 'sv', 'pupil', 'learner']);

export function isAdminRole(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.has(r.toLowerCase()));
}

export function isLecturerRole(roles: string[]): boolean {
  return roles.some((r) => LECTURER_ROLES.has(r.toLowerCase()));
}

export function isStudentRole(roles: string[]): boolean {
  return roles.length === 0 || roles.some((r) => STUDENT_ROLES.has(r.toLowerCase()));
}
