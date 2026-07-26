import { FileText, BookOpen, Star, GraduationCap, Bell } from 'lucide-react';
import type { AppNotifType } from '@/types';

export const NOTIF_TYPE_META: Record<AppNotifType, { icon: React.ReactNode; color: string }> = {
  form_approved: { icon: <FileText size={15} className="text-[#00c578]" />,      color: 'bg-[#00c578]/12' },
  form_rejected: { icon: <FileText size={15} className="text-[#ef4e49]" />,      color: 'bg-[#ef4e49]/12' },
  form_pending:  { icon: <FileText size={15} className="text-[#f5832f]" />,      color: 'bg-[#f5832f]/12' },
  grade:         { icon: <Star size={15} className="text-[#0057A8]" />,          color: 'bg-[#0057A8]/10' },
  course:        { icon: <BookOpen size={15} className="text-[#0057A8]" />,      color: 'bg-[#0057A8]/10' },
  system:        { icon: <GraduationCap size={15} className="text-[#99a3ad]" />, color: 'bg-[#33485c]/15' },
};

export const DEFAULT_NOTIF_META = {
  icon: <Bell size={15} className="text-slate-400" />,
  color: 'bg-slate-100',
};
