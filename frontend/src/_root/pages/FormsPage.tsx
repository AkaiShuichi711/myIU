import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, Download, Plus, Pencil, Trash2,
  Loader2, X, Check, ExternalLink, Send, Inbox, Search, FolderOpen,
  Clock, CheckCircle2, XCircle, ChevronRight, ArrowUpDown,
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { isAdminRole } from '@/lib/utils';
import {
  useGetFormTemplates,
  useCreateFormTemplate,
  useUpdateFormTemplate,
  useDeleteFormTemplate,
  useGetFormSubmissionsByUser,
  useGetFormSubmissionsForApprover,
} from '@/lib/react-query/queriesAndMutations';
import type { FormCategory, FormFileType, IFormTemplate, IFormSubmission } from '@/types';
import FormSubmitModal from '@/components/shared/FormSubmitModal';
import { FORM_STATUS, FILE_TYPE_META, FORM_CATEGORIES, INPUT_CLS } from '@/constants/ui';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  } catch { return '—'; }
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const STAT_COLORS = {
  sky:     { text: 'text-sky-600 dark:text-sky-400'     },
  amber:   { text: 'text-amber-600 dark:text-amber-400'   },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400' },
  rose:    { text: 'text-rose-600 dark:text-rose-400'    },
};
type StatColor = keyof typeof STAT_COLORS;

const StatCard = ({ label, value, color, icon: Icon }: { label: string; value: number; color: StatColor; icon: typeof Clock }) => {
  const c = STAT_COLORS[color];
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/40 bg-white dark:bg-[#19191a]">
      <Icon size={18} className={c.text} />
      <div>
        <p className={`text-xl font-bold leading-none ${c.text}`}>{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

// ── File type badge ────────────────────────────────────────────────────────────
const FileTypeBadge = ({ type }: { type: FormFileType }) => {
  const meta = FILE_TYPE_META[type] ?? FILE_TYPE_META['other'];
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${meta.color} ${meta.bg}`}>
      {meta.label}
    </span>
  );
};

// ── Table column header ────────────────────────────────────────────────────────
const TH = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap ${className}`}>
    {children}
  </th>
);

// ── Submission table row ───────────────────────────────────────────────────────
const SubmissionRow = ({ sub, mode = 'mine' }: { sub: IFormSubmission; mode?: 'mine' | 'review' }) => {
  const meta = FORM_STATUS[sub.status] ?? FORM_STATUS.pending;
  const StatusIcon = meta.Icon;
  return (
    <tr className="group border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
      {/* Form name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <FileText size={13} className="text-slate-400 dark:text-slate-500" />
          </div>
          <Link
            to={`/forms/review/${sub.$id}`}
            className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:text-[#009CD1] transition-colors truncate max-w-[260px]"
          >
            {sub.formTitle ?? '—'}
          </Link>
        </div>
      </td>

      {/* Reviewer / Submitter */}
      <td className="px-4 py-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[180px]">
          {mode === 'review'
            ? (sub.submitterName || sub.submitterEmail || '—')
            : (sub.approverName || sub.approverEmail || '—')}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <span translate="no" className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {fmtDate(sub.$createdAt)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span translate="no" className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.cls}`}>
          <StatusIcon size={10} /> {meta.label}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        <Link
          to={`/forms/review/${sub.$id}`}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#009CD1] font-medium transition-colors opacity-0 group-hover:opacity-100"
        >
          Chi tiết <ChevronRight size={12} />
        </Link>
      </td>
    </tr>
  );
};

// ── Form row (catalog tab) ─────────────────────────────────────────────────────
const FormRow = ({
  form, isAdmin, onEdit, onDelete, onSubmit,
}: {
  form: IFormTemplate; isAdmin: boolean;
  onEdit: (f: IFormTemplate) => void;
  onDelete: (id: string) => void;
  onSubmit: (f: IFormTemplate) => void;
}) => (
  <tr className="group border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <FileText size={13} className="text-slate-400 dark:text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{form.title}</p>
          {form.description && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{form.description}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <FileTypeBadge type={form.fileType} />
    </td>
    <td className="px-4 py-3">
      {(() => { const c = FORM_CATEGORIES.find(c => c.id === form.category); return c ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.label}</span>
      ) : null; })()}
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <a
          href={form.fileUrl} target="_blank" rel="noopener noreferrer" download={form.fileName || true}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          <Download size={11} /> Tải về
        </a>
        <button
          onClick={() => onSubmit(form)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-all"
        >
          <Send size={11} /> Nộp
        </button>
        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(form)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-600 transition-colors">
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(form.$id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </td>
  </tr>
);

// ── Edit panel ─────────────────────────────────────────────────────────────────
const BLANK_FORM = { title:'', description:'', fileUrl:'', fileName:'', fileType:'pdf' as FormFileType, category:'academic' as FormCategory, sortOrder:0, isActive:true, createdBy:'' };
type EditState = typeof BLANK_FORM;

const EditPanel = ({ state, onChange, onSave, onCancel, isSaving, isNew }: {
  state: EditState; onChange: (k: keyof EditState, v: any) => void;
  onSave: () => void; onCancel: () => void; isSaving: boolean; isNew: boolean;
}) => (
  <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-[#009CD1]/20 p-5 mb-4">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {isNew ? 'Thêm biểu mẫu mới' : 'Chỉnh sửa biểu mẫu'}
      </p>
      <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tiêu đề *</label>
        <input value={state.title} onChange={(e) => onChange('title', e.target.value)} placeholder="VD: Đơn xin nghỉ học" className={INPUT_CLS} />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả (tùy chọn)</label>
        <input value={state.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Mô tả ngắn..." className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Danh mục</label>
        <select value={state.category} onChange={(e) => onChange('category', e.target.value as FormCategory)} className={INPUT_CLS}>
          {FORM_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Loại file</label>
        <select value={state.fileType} onChange={(e) => onChange('fileType', e.target.value as FormFileType)} className={INPUT_CLS}>
          {Object.entries(FILE_TYPE_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên file hiển thị *</label>
        <input value={state.fileName} onChange={(e) => onChange('fileName', e.target.value)} placeholder="don_xin_nghi_hoc.pdf" className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Thứ tự hiển thị</label>
        <input type="number" value={state.sortOrder} onChange={(e) => onChange('sortOrder', parseInt(e.target.value)||0)} className={INPUT_CLS} min={0} />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Link tải file * <span className="text-slate-300 font-normal">(Google Drive, SharePoint...)</span>
        </label>
        <div className="flex gap-2">
          <input value={state.fileUrl} onChange={(e) => onChange('fileUrl', e.target.value)} placeholder="https://drive.google.com/..." className={INPUT_CLS} />
          {state.fileUrl && (
            <a href={state.fileUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center text-slate-400 hover:text-[#0085b3] transition-colors shrink-0">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
    <div className="flex justify-end gap-2 mt-4">
      <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
      <button
        onClick={onSave}
        disabled={isSaving || !state.title.trim() || !state.fileUrl.trim() || !state.fileName.trim()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors disabled:opacity-60"
      >
        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        {isNew ? 'Thêm biểu mẫu' : 'Lưu thay đổi'}
      </button>
    </div>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, label, action }: { icon: typeof Inbox; label: string; action?: React.ReactNode }) => (
  <tr><td colSpan={5}>
    <div className="flex flex-col items-center py-14 gap-2 text-center">
      <Icon size={28} className="text-slate-200 dark:text-slate-700" />
      <p className="text-sm text-slate-400 dark:text-slate-500">{label}</p>
      {action}
    </div>
  </td></tr>
);

// ── Table wrapper ──────────────────────────────────────────────────────────────
const TableWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[580px]">{children}</table>
    </div>
  </div>
);

const TableHead = ({ cols }: { cols: string[] }) => (
  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
    <tr>{cols.map((c, i) => <TH key={i} className={i === cols.length - 1 ? 'text-right' : ''}>{c}</TH>)}</tr>
  </thead>
);

// ── Section label row ──────────────────────────────────────────────────────────
const SectionRow = ({ icon: Icon, label, count, badge }: { icon: typeof Inbox; label: string; count: number; badge?: React.ReactNode }) => (
  <tr className="bg-slate-50/60 dark:bg-slate-800/40">
    <td colSpan={5} className="px-4 py-2 border-y border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-slate-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        {badge}
        <span className="ml-auto text-[10px] text-slate-400 font-mono tabular-nums">{count} yêu cầu</span>
      </div>
    </td>
  </tr>
);

// ── Types ──────────────────────────────────────────────────────────────────────
type PageTab  = 'forms' | 'my-requests';
type MyFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'to-review';

// ── Main page ──────────────────────────────────────────────────────────────────
const FormsPage = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(user.roles);

  const [pageTab, setPageTab]           = useState<PageTab>('forms');
  const [filter, setFilter]             = useState<FormCategory | 'all'>('all');
  const [formSearch, setFormSearch]     = useState('');
  const [myFilter, setMyFilter]         = useState<MyFilter>('all');
  const [mySearch, setMySearch]         = useState('');
  const [editing, setEditing]           = useState<IFormTemplate | null>(null);
  const [showCreate, setShowCreate]     = useState(false);
  const [editState, setEditState]       = useState<EditState>(BLANK_FORM);
  const [submitTarget, setSubmitTarget] = useState<IFormTemplate | null>(null);

  const { data: templates = [], isPending } = useGetFormTemplates();
  const { mutate: createForm, isPending: isCreating } = useCreateFormTemplate();
  const { mutate: updateForm, isPending: isUpdating } = useUpdateFormTemplate();
  const { mutate: deleteForm } = useDeleteFormTemplate();

  const { data: mySubmissionsRaw = [] } = useGetFormSubmissionsByUser(user.id);
  const { data: toReviewRaw = [] }      = useGetFormSubmissionsForApprover(user.email);
  const mySubmissions = mySubmissionsRaw as unknown as IFormSubmission[];
  const toReview      = toReviewRaw      as unknown as IFormSubmission[];

  const pendingMine  = mySubmissions.filter(s => s.status === 'pending').length;
  const approvedMine = mySubmissions.filter(s => s.status === 'approved').length;
  const rejectedMine = mySubmissions.filter(s => s.status === 'rejected').length;
  const pendingCount = toReview.filter(s => s.status === 'pending').length;

  const handleChange = (k: keyof EditState, v: any) => setEditState(s => ({ ...s, [k]: v }));

  const handleCreate = () => {
    if (!editState.title.trim() || !editState.fileUrl.trim()) return;
    createForm({ ...editState, createdBy: user.id }, {
      onSuccess: () => { setShowCreate(false); setEditState(BLANK_FORM); },
    });
  };
  const handleUpdate = () => {
    if (!editing || !editState.title.trim() || !editState.fileUrl.trim()) return;
    updateForm({ id: editing.$id, ...editState }, {
      onSuccess: () => { setEditing(null); setEditState(BLANK_FORM); },
    });
  };
  const startEdit = (form: IFormTemplate) => {
    setShowCreate(false); setEditing(form);
    setEditState({ title:form.title, description:form.description??'', fileUrl:form.fileUrl, fileName:form.fileName, fileType:form.fileType, category:form.category, sortOrder:form.sortOrder, isActive:form.isActive, createdBy:form.createdBy });
  };
  const startCreate = () => { setEditing(null); setShowCreate(true); setEditState({ ...BLANK_FORM, createdBy: user.id }); };

  const q = formSearch.trim().toLowerCase();
  const groupedForms = FORM_CATEGORIES.reduce<Record<string, IFormTemplate[]>>((acc, cat) => {
    const items = (templates as unknown as IFormTemplate[]).filter(f => {
      const matchCat    = filter === 'all' || filter === cat.id;
      const matchSearch = !q || f.title.toLowerCase().includes(q) || (f.description??'').toLowerCase().includes(q);
      return f.category === cat.id && matchCat && matchSearch;
    });
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {});

  const mq = mySearch.trim().toLowerCase();
  const filteredMy = mySubmissions.filter(s => {
    const matchStatus = myFilter === 'all' || myFilter === 'to-review' || myFilter === s.status;
    const matchSearch = !mq || (s.formTitle??'').toLowerCase().includes(mq);
    return matchStatus && matchSearch;
  });
  const filteredReview = toReview.filter(s =>
    !mq || (s.formTitle??'').toLowerCase().includes(mq) || (s.submitterName??'').toLowerCase().includes(mq)
  );

  const MY_STATUS_FILTERS: { id: MyFilter; label: string }[] = [
    { id: 'all',       label: 'Tất cả' },
    { id: 'pending',   label: 'Chờ duyệt' },
    { id: 'approved',  label: 'Đã duyệt' },
    { id: 'rejected',  label: 'Đã từ chối' },
    { id: 'to-review', label: `Cần tôi duyệt${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
  ];

  const PAGE_TABS = [
    { id: 'forms'      as PageTab, label: 'Biểu mẫu',       icon: FileText },
    { id: 'my-requests'as PageTab, label: 'Yêu cầu của tôi', icon: Send, badge: pendingCount || undefined },
  ];

  const searchCls = 'w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009CD1]/20 focus:border-[#009CD1] transition-all';

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 pt-4 pb-3">

          {/* Breadcrumb + action */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <button onClick={() => navigate('/home')} className="text-slate-400 hover:text-[#0085b3] transition-colors">HOME</button>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <FileText size={13} /> BIỂU MẪU
              </span>
            </div>
            {isAdmin && pageTab === 'forms' && !showCreate && !editing && (
              <button
                onClick={startCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors"
              >
                <Plus size={12} /> Thêm biểu mẫu
              </button>
            )}
          </div>

          {/* Page tabs + search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {PAGE_TABS.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id} onClick={() => setPageTab(id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    pageTab === id
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={11} /> {label}
                  {badge && badge > 0 && (
                    <span className="min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={pageTab === 'forms' ? formSearch : mySearch}
                onChange={(e) => pageTab === 'forms' ? setFormSearch(e.target.value) : setMySearch(e.target.value)}
                placeholder={pageTab === 'forms' ? 'Tìm biểu mẫu...' : 'Tìm yêu cầu...'}
                className={searchCls}
              />
            </div>
          </div>

          {/* Sub-filters */}
          {pageTab === 'forms' && (
            <div className="flex gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-0.5 rounded-lg w-fit border border-slate-100 dark:border-slate-700/40 mt-2.5">
              {[{ id: 'all' as FormCategory|'all', label: 'Tất cả' }, ...FORM_CATEGORIES.map(c => ({ id: c.id as FormCategory|'all', label: c.label }))].map(({ id, label }) => (
                <button key={id} onClick={() => setFilter(id as any)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    filter === id ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >{label}</button>
              ))}
            </div>
          )}

          {pageTab === 'my-requests' && (
            <div className="flex gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-0.5 rounded-lg w-fit border border-slate-100 dark:border-slate-700/40 mt-2.5 flex-wrap">
              {MY_STATUS_FILTERS.map(({ id, label }) => (
                <button key={id} onClick={() => setMyFilter(id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    myFilter === id ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {id === 'to-review' && pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-5 flex flex-col gap-5">

        {/* ── Tab: Biểu mẫu ── */}
        {pageTab === 'forms' && (
          <>
            {(showCreate || editing) && (
              <EditPanel
                state={editState} onChange={handleChange}
                onSave={editing ? handleUpdate : handleCreate}
                onCancel={() => { setEditing(null); setShowCreate(false); setEditState(BLANK_FORM); }}
                isSaving={editing ? isUpdating : isCreating} isNew={!editing}
              />
            )}

            {isPending ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
            ) : Object.keys(groupedForms).length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <FolderOpen size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                  {q ? `Không tìm thấy kết quả cho "${formSearch}"` : 'Chưa có biểu mẫu nào'}
                </p>
                {isAdmin && !q && (
                  <button onClick={startCreate} className="text-xs text-[#009CD1] hover:underline">+ Thêm biểu mẫu đầu tiên</button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {FORM_CATEGORIES.filter(c => groupedForms[c.id]).map(({ id, label, icon: Icon }) => (
                  <TableWrap key={id}>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                      <tr>
                        <td colSpan={4} className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className="text-slate-400" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                            <span className="ml-auto text-[10px] text-slate-400 font-mono">{groupedForms[id].length} biểu mẫu</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-slate-100 dark:border-slate-700">
                        <TH>Tên biểu mẫu</TH>
                        <TH>Loại</TH>
                        <TH>Danh mục</TH>
                        <TH className="text-right">Thao tác</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedForms[id].map(form =>
                        editing?.$id === form.$id ? (
                          <tr key={form.$id} className="bg-[#009CD1]/5 border-b border-slate-50 dark:border-slate-700/40">
                            <td colSpan={4} className="px-4 py-2.5">
                              <p className="text-xs text-[#009CD1] font-semibold flex items-center gap-1">
                                <Pencil size={11} /> Đang chỉnh sửa: {form.title}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          <FormRow key={form.$id} form={form} isAdmin={isAdmin}
                            onEdit={startEdit} onDelete={(fid) => deleteForm(fid)} onSubmit={setSubmitTarget}
                          />
                        )
                      )}
                    </tbody>
                  </TableWrap>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Tab: Yêu cầu của tôi ── */}
        {pageTab === 'my-requests' && (
          <>
            {/* Stat cards */}
            {myFilter === 'all' && mySubmissions.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Tổng cộng"    value={mySubmissions.length} color="sky"     icon={ArrowUpDown}   />
                <StatCard label="Chờ duyệt"    value={pendingMine}          color="amber"   icon={Clock}         />
                <StatCard label="Đã duyệt"     value={approvedMine}         color="emerald" icon={CheckCircle2}  />
                <StatCard label="Đã từ chối"   value={rejectedMine}         color="rose"    icon={XCircle}       />
              </div>
            )}

            {/* Submissions table */}
            <TableWrap>
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <TH>Biểu mẫu</TH>
                  <TH>{myFilter === 'to-review' ? 'Người nộp' : 'Người duyệt'}</TH>
                  <TH>Ngày nộp</TH>
                  <TH>Trạng thái</TH>
                  <TH className="text-right"></TH>
                </tr>
              </thead>
              <tbody>
                {/* My submissions section */}
                {myFilter !== 'to-review' && (
                  <>
                    <SectionRow icon={Send} label="Yêu cầu đã nộp" count={filteredMy.length} />
                    {filteredMy.length === 0 ? (
                      <Empty icon={Send}
                        label={mq ? `Không tìm thấy "${mySearch}"` : 'Chưa có yêu cầu nào'}
                        action={!mq ? (
                          <button onClick={() => setPageTab('forms')} className="text-xs text-[#009CD1] hover:underline mt-1">
                            Nộp biểu mẫu đầu tiên
                          </button>
                        ) : undefined}
                      />
                    ) : filteredMy.map(sub => <SubmissionRow key={sub.$id} sub={sub} mode="mine" />)}
                  </>
                )}

                {/* To-review section */}
                {(myFilter === 'all' || myFilter === 'to-review') && (
                  <>
                    <SectionRow
                      icon={Inbox} label="Cần tôi duyệt" count={filteredReview.length}
                      badge={pendingCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">{pendingCount}</span>
                      ) : undefined}
                    />
                    {filteredReview.length === 0 ? (
                      <Empty icon={Inbox} label={mq ? `Không tìm thấy "${mySearch}"` : 'Không có yêu cầu nào cần duyệt'} />
                    ) : filteredReview.map(sub => <SubmissionRow key={sub.$id} sub={sub} mode="review" />)}
                  </>
                )}
              </tbody>
            </TableWrap>
          </>
        )}
      </div>

      {submitTarget && (
        <FormSubmitModal
          template={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSuccess={() => { setSubmitTarget(null); setPageTab('my-requests'); }}
        />
      )}
    </div>
  );
};

export default FormsPage;
