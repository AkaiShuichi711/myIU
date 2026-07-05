import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { SubmissionStatus, FormCategory, FormFileType } from '@/types';

// ── Form / submission status ──────────────────────────────────────────────────
export const FORM_STATUS: Record<SubmissionStatus, {
  label: string;
  color: string;   // text-[hex]
  bg:    string;   // bg-[hex]/10
  cls:   string;   // combined: bg + text
  hex:   string;   // raw hex for style={{ color }}
  Icon:  typeof Clock;
}> = {
  pending:  { label: 'Chờ duyệt', color: 'text-[#f5832f]', bg: 'bg-[#f5832f]/10', cls: 'bg-[#f5832f]/10 text-[#f5832f]', hex: '#f5832f', Icon: Clock         },
  approved: { label: 'Đã duyệt',  color: 'text-[#00c578]', bg: 'bg-[#00c578]/10', cls: 'bg-[#00c578]/10 text-[#00c578]', hex: '#00c578', Icon: CheckCircle2   },
  rejected: { label: 'Đã từ chối', color: 'text-[#ef4e49]', bg: 'bg-[#ef4e49]/10', cls: 'bg-[#ef4e49]/10 text-[#ef4e49]', hex: '#ef4e49', Icon: XCircle        },
};

// ── File type badges ──────────────────────────────────────────────────────────
export const FILE_TYPE_META: Record<FormFileType | 'other', { label: string; color: string; bg: string }> = {
  pdf:   { label: 'PDF',  color: 'text-[#ef4e49]', bg: 'bg-[#ef4e49]/10' },
  docx:  { label: 'DOCX', color: 'text-[#009CD1]', bg: 'bg-[#009CD1]/10' },
  doc:   { label: 'DOC',  color: 'text-[#00adf4]', bg: 'bg-[#00adf4]/10' },
  xlsx:  { label: 'XLSX', color: 'text-[#00c578]', bg: 'bg-[#00c578]/10' },
  ppt:   { label: 'PPT',  color: 'text-[#f5832f]', bg: 'bg-[#f5832f]/10' },
  other: { label: 'FILE', color: 'text-[#99a3ad]', bg: 'bg-[#33485c]/10' },
};

// ── Form categories ───────────────────────────────────────────────────────────
import { GraduationCap, Banknote, Building2, FolderOpen } from 'lucide-react';

export const FORM_CATEGORIES: { id: FormCategory; label: string; icon: typeof GraduationCap }[] = [
  { id: 'academic',       label: 'Học vụ',     icon: GraduationCap },
  { id: 'finance',        label: 'Tài chính',  icon: Banknote      },
  { id: 'administrative', label: 'Hành chính', icon: Building2     },
  { id: 'other',          label: 'Khác',       icon: FolderOpen    },
];

// ── Shared input class ────────────────────────────────────────────────────────
// Same as INPUT_CLS in constants/courses.ts — use that one; this re-export avoids a second definition
export { INPUT_CLS } from './courses';
