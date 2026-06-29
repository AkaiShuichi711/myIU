import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, FileText, Download, Plus, Pencil, Trash2,
  Loader2, X, Check, ExternalLink, Send, Inbox, Search, FolderOpen,
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

const SubmissionRow = ({ sub, mode = 'mine' }: { sub: IFormSubmission; mode?: 'mine' | 'review' }) => {
  const meta = FORM_STATUS[sub.status] ?? FORM_STATUS.pending;
  const StatusIcon = meta.Icon;
  const dateStr = sub.$createdAt
    ? (() => { try { return new Date(sub.$createdAt).toLocaleDateString('vi-VN'); } catch { return '—'; } })()
    : '—';
  return (
    <Link
      to={`/forms/review/${sub.$id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <FileText size={14} className="text-slate-400 dark:text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{sub.formTitle ?? '—'}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
          {mode === 'review'
            ? `Từ: ${sub.submitterName || sub.submitterEmail || '—'}`
            : `Người duyệt: ${sub.approverName || sub.approverEmail || '—'}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${meta.color} ${meta.bg}`}>
          <StatusIcon size={10} /> {meta.label}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{dateStr}</span>
      </div>
    </Link>
  );
};

// ── Constants ─────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  title: '',
  description: '',
  fileUrl: '',
  fileName: '',
  fileType: 'pdf' as FormFileType,
  category: 'academic' as FormCategory,
  sortOrder: 0,
  isActive: true,
  createdBy: '',
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

// ── Inline edit form ───────────────────────────────────────────────────────────
type EditState = typeof BLANK_FORM;

const FormRow = ({
  form,
  isAdmin,
  onEdit,
  onDelete,
  onSubmit,
}: {
  form: IFormTemplate;
  isAdmin: boolean;
  onEdit: (f: IFormTemplate) => void;
  onDelete: (id: string) => void;
  onSubmit: (f: IFormTemplate) => void;
}) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
      <FileText size={14} className="text-slate-400 dark:text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{form.title}</p>
      {form.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{form.description}</p>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <FileTypeBadge type={form.fileType} />
      <a
        href={form.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={form.fileName || true}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={12} /> Tải về
      </a>
      <button
        onClick={() => onSubmit(form)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#F15A22] hover:bg-[#0087b3] transition-all"
      >
        <Send size={12} /> Nộp
      </button>
      {isAdmin && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(form)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(form.$id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  </div>
);

// ── Edit / Create Panel ────────────────────────────────────────────────────────
const EditPanel = ({
  state,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isNew,
}: {
  state: EditState;
  onChange: (k: keyof EditState, v: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isNew: boolean;
}) => (
  <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-[#F15A22]/20 p-4 mb-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
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
        <input value={state.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Mô tả ngắn về biểu mẫu..." className={INPUT_CLS} />
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
          {Object.entries(FILE_TYPE_META).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tên file hiển thị *</label>
        <input value={state.fileName} onChange={(e) => onChange('fileName', e.target.value)} placeholder="VD: don_xin_nghi_hoc.pdf" className={INPUT_CLS + ' text-xs'} />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Thứ tự hiển thị</label>
        <input type="number" value={state.sortOrder} onChange={(e) => onChange('sortOrder', parseInt(e.target.value) || 0)} className={INPUT_CLS} min={0} />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Link tải file * <span className="text-slate-300 font-normal">(Google Drive, SharePoint, OneDrive...)</span>
        </label>
        <div className="flex gap-2">
          <input value={state.fileUrl} onChange={(e) => onChange('fileUrl', e.target.value)} placeholder="https://drive.google.com/..." className={INPUT_CLS} />
          {state.fileUrl && (
            <a href={state.fileUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center text-slate-400 hover:text-[#F15A22] transition-colors shrink-0">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
      <button
        onClick={onSave}
        disabled={isSaving || !state.title.trim() || !state.fileUrl.trim() || !state.fileName.trim()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#F15A22] hover:bg-[#0087b3] transition-colors disabled:opacity-60"
      >
        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        {isNew ? 'Thêm biểu mẫu' : 'Lưu thay đổi'}
      </button>
    </div>
  </div>
);

type PageTab  = 'forms' | 'my-requests';
type MyFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'to-review';

// ── Main Page ──────────────────────────────────────────────────────────────────
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

  const { data: mySubmissionsRaw = [] }   = useGetFormSubmissionsByUser(user.id);
  const { data: toReviewRaw = [] }        = useGetFormSubmissionsForApprover(user.email);

  const mySubmissions = mySubmissionsRaw as unknown as IFormSubmission[];
  const toReview      = toReviewRaw      as unknown as IFormSubmission[];

  const pendingCount   = toReview.filter((s) => s.status === 'pending').length;

  const allForms = templates as unknown as IFormTemplate[];

  const handleChange = (k: keyof EditState, v: any) =>
    setEditState((s) => ({ ...s, [k]: v }));

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
    setShowCreate(false);
    setEditing(form);
    setEditState({
      title:       form.title,
      description: form.description ?? '',
      fileUrl:     form.fileUrl,
      fileName:    form.fileName,
      fileType:    form.fileType,
      category:    form.category,
      sortOrder:   form.sortOrder,
      isActive:    form.isActive,
      createdBy:   form.createdBy,
    });
  };

  const startCreate = () => {
    setEditing(null);
    setShowCreate(true);
    setEditState({ ...BLANK_FORM, createdBy: user.id });
  };

  // ── Derived / filtered data ────────────────────────────────────────────────
  const q = formSearch.trim().toLowerCase();
  const groupedForms = FORM_CATEGORIES.reduce<Record<string, IFormTemplate[]>>((acc, cat) => {
    const items = allForms.filter((f) => {
      const matchCat  = filter === 'all' || filter === cat.id;
      const matchSearch = !q || f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q);
      return f.category === cat.id && matchCat && matchSearch;
    });
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {});

  const mq = mySearch.trim().toLowerCase();
  const filteredMy = mySubmissions.filter((s) => {
    const matchStatus = myFilter === 'all' || myFilter === s.status;
    const matchSearch = !mq || (s.formTitle ?? '').toLowerCase().includes(mq);
    return matchStatus && matchSearch;
  });
  const filteredReview = toReview.filter((s) => {
    const matchSearch = !mq || (s.formTitle ?? '').toLowerCase().includes(mq) || (s.submitterName ?? '').toLowerCase().includes(mq);
    return matchSearch;
  });

  const MY_STATUS_FILTERS: { id: MyFilter; label: string }[] = [
    { id: 'all',       label: 'Tất cả' },
    { id: 'pending',   label: 'Chờ duyệt' },
    { id: 'approved',  label: 'Đã duyệt' },
    { id: 'rejected',  label: 'Từ chối' },
    { id: 'to-review', label: `Cần tôi duyệt${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
  ];

  const PAGE_TABS: { id: PageTab; label: string; icon: typeof FileText; badge?: number }[] = [
    { id: 'forms',       label: 'Biểu mẫu',       icon: FileText },
    { id: 'my-requests', label: 'Yêu cầu của tôi', icon: Send, badge: pendingCount || undefined },
  ];

  const searchInputCls = 'w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F15A22]/20 focus:border-[#F15A22] transition-all';

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-[#F15A22] transition-colors font-mono"
              >
                <Home size={11} /> HOME
              </button>
              <span className="text-slate-300 dark:text-slate-700 text-[11px]">/</span>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-700 dark:text-slate-300" />
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">BIỂU MẪU</h1>
              </div>
            </div>
            {isAdmin && pageTab === 'forms' && !showCreate && !editing && (
              <button
                onClick={startCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors"
              >
                <Plus size={12} /> Thêm biểu mẫu
              </button>
            )}
          </div>

          {/* Page tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {PAGE_TABS.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setPageTab(id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    pageTab === id
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={11} /> {label}
                  {badge && badge > 0 && (
                    <span className="ml-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search bar — inline next to tabs */}
            {pageTab === 'forms' && (
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={formSearch}
                  onChange={(e) => setFormSearch(e.target.value)}
                  placeholder="Tìm biểu mẫu..."
                  className={searchInputCls}
                />
              </div>
            )}
            {pageTab === 'my-requests' && (
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={mySearch}
                  onChange={(e) => setMySearch(e.target.value)}
                  placeholder="Tìm theo tên biểu mẫu..."
                  className={searchInputCls}
                />
              </div>
            )}
          </div>

          {/* Category filter — forms tab */}
          {pageTab === 'forms' && (
            <div className="flex gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-0.5 rounded-lg w-fit border border-slate-100 dark:border-slate-700/40 mt-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Tất cả
              </button>
              {FORM_CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    filter === id
                      ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={10} /> {label}
                </button>
              ))}
            </div>
          )}

          {/* Status filter — my-requests tab */}
          {pageTab === 'my-requests' && (
            <div className="flex gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-0.5 rounded-lg w-fit border border-slate-100 dark:border-slate-700/40 mt-2 flex-wrap">
              {MY_STATUS_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setMyFilter(id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    myFilter === id
                      ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {id === 'to-review' && pendingCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">

        {/* ── Tab: Biểu mẫu ── */}
        {pageTab === 'forms' && (
          <>
            {(showCreate || editing) && (
              <EditPanel
                state={editState}
                onChange={handleChange}
                onSave={editing ? handleUpdate : handleCreate}
                onCancel={() => { setEditing(null); setShowCreate(false); setEditState(BLANK_FORM); }}
                isSaving={editing ? isUpdating : isCreating}
                isNew={!editing}
              />
            )}
            {isPending ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : Object.keys(groupedForms).length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <FolderOpen size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
                  {q ? `Không tìm thấy kết quả cho "${formSearch}"` : 'Chưa có biểu mẫu nào'}
                </p>
                {isAdmin && !q && (
                  <button onClick={startCreate} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    + Thêm biểu mẫu đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {FORM_CATEGORIES.filter((c) => groupedForms[c.id]).map(({ id, label, icon: Icon }) => (
                  <div key={id} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                      <Icon size={13} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {groupedForms[id].length} biểu mẫu
                      </span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {groupedForms[id].map((form) => (
                        editing?.$id === form.$id ? (
                          <div key={form.$id} className="px-4 py-3 bg-[#F15A22]/4 dark:bg-[#F15A22]/6 border-l-2 border-[#F15A22]">
                            <p className="text-xs text-[#F15A22] font-semibold mb-1 flex items-center gap-1">
                              <Pencil size={11} /> Đang chỉnh sửa: {form.title}
                            </p>
                          </div>
                        ) : (
                          <FormRow
                            key={form.$id}
                            form={form}
                            isAdmin={isAdmin}
                            onEdit={startEdit}
                            onDelete={(fid) => deleteForm(fid)}
                            onSubmit={setSubmitTarget}
                          />
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isAdmin && (
              <p className="mt-6 text-center text-[11px] text-slate-300 dark:text-slate-600 font-mono">
                ADMIN MODE — AZURE AD ROLE DETECTED
              </p>
            )}
          </>
        )}

        {/* ── Tab: Yêu cầu của tôi ── */}
        {pageTab === 'my-requests' && (
          <div className="flex flex-col gap-4">
            {/* My submissions (hidden when filter = to-review) */}
            {myFilter !== 'to-review' && (
              <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <Send size={13} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Yêu cầu đã nộp</span>
                  <span className="ml-auto text-[10px] text-slate-400 font-mono">{filteredMy.length} yêu cầu</span>
                </div>
                {filteredMy.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-2 text-center">
                    <Send size={22} className="text-slate-200 dark:text-slate-700" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {mq ? `Không tìm thấy kết quả cho "${mySearch}"` : 'Chưa có yêu cầu nào'}
                    </p>
                    {!mq && (
                      <button onClick={() => setPageTab('forms')} className="text-xs text-[#F15A22] hover:underline mt-1">
                        Nộp biểu mẫu đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {filteredMy.map((sub) => <SubmissionRow key={sub.$id} sub={sub} mode="mine" />)}
                  </div>
                )}
              </div>
            )}

            {/* To-review section (shown when filter = all or to-review) */}
            {(myFilter === 'all' || myFilter === 'to-review') && (
              <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <Inbox size={13} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cần tôi duyệt
                  </span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">{pendingCount}</span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-400 font-mono">{filteredReview.length} yêu cầu</span>
                </div>
                {filteredReview.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-2 text-center">
                    <Inbox size={22} className="text-slate-200 dark:text-slate-700" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {mq ? `Không tìm thấy kết quả cho "${mySearch}"` : 'Không có yêu cầu nào cần duyệt'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {filteredReview.map((sub) => <SubmissionRow key={sub.$id} sub={sub} mode="review" />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit modal */}
      {submitTarget && (
        <FormSubmitModal
          template={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSuccess={() => {
            setSubmitTarget(null);
            setPageTab('my-requests');
          }}
        />
      )}
    </div>
  );
};

export default FormsPage;
