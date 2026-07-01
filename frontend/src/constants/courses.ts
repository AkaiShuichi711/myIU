export const COVER_GRADIENTS: Record<string, string> = {
  '#323393': '#323393',
  '#e74c3c': '#e74c3c',
  '#27ae60': '#27ae60',
  '#f39c12': '#f39c12',
  '#8e44ad': '#8e44ad',
  '#16a085': '#16a085',
  '#179BD7': '#179BD7',
  '#f5832f': '#f5832f',
};

export const COVER_OPTIONS = [
  { color: '#323393', label: 'Xanh dương' },
  { color: '#e74c3c', label: 'Đỏ' },
  { color: '#27ae60', label: 'Xanh lá' },
  { color: '#f39c12', label: 'Cam' },
  { color: '#8e44ad', label: 'Tím' },
  { color: '#16a085', label: 'Ngọc' },
];

export const COVER_COLORS = Object.keys(COVER_GRADIENTS);

export const SEMESTERS = [
  'HK1 2024-2025', 'HK2 2024-2025', 'HK3 2024-2025',
  'HK1 2025-2026', 'HK2 2025-2026', 'HK3 2025-2026',
];

export const CIRCUIT_BG_STYLE: React.CSSProperties = {};

export const INPUT_CLS =
  'w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#323393]/25 focus:border-[#323393] transition-all';
