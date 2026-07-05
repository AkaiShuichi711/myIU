import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useCreateSupportTicket } from '@/lib/react-query/queriesAndMutations';
import { upload } from '@/lib/api/client';

const SERVICES = [
  'Học vụ',
  'Tài chính / Học phí',
  'Ký túc xá',
  'Thư viện',
  'IT / Hệ thống',
  'Khác',
] as const;

const NEEDS = [
  'Tra cứu thông tin',
  'Khiếu nại / phản ánh',
  'Đề nghị hỗ trợ',
  'Tư vấn',
] as const;

const MAX_DESC    = 2000;
const MAX_FILE_MB = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

const inputBase =
  'w-full rounded-xl border border-slate-200 dark:border-[#2a3a4a] bg-slate-50 dark:bg-dark-3 text-[13px] text-slate-700 dark:text-light-2 px-3.5 py-2.5 transition focus:outline-none focus:border-[#009CD1]/50 focus:bg-white dark:focus:bg-dark-2 focus:ring-2 focus:ring-[#009CD1]/10';

export default function SupportPage() {
  const navigate = useNavigate();
  const createTicket = useCreateSupportTicket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [service, setService]     = useState('');
  const [need, setNeed]           = useState('');
  const [desc, setDesc]           = useState('');
  const [file, setFile]           = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const canSubmit = service && need && desc.trim().length > 0 && !uploading;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File không được vượt quá ${MAX_FILE_MB} MB`);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Định dạng file không được hỗ trợ (PDF, Word, Excel, ảnh, txt)');
      return;
    }
    setError(null);
    setFile(f);
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function resetForm() {
    setSubmitted(false);
    setService(''); setNeed(''); setDesc('');
    setFile(null); setTicketId(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    let attachmentUrl: string | undefined;
    if (file) {
      setUploading(true);
      try {
        attachmentUrl = await upload('/api/storage/upload', file) as string;
      } catch {
        setError('Upload file thất bại. Vui lòng thử lại.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    createTicket.mutate(
      { service, need, description: desc, attachmentUrl },
      {
        onSuccess: (data: any) => {
          setTicketId(data?.id ?? null);
          setSubmitted(true);
        },
        onError: () => {
          setError('Gửi yêu cầu thất bại. Vui lòng thử lại.');
        },
      }
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-dark-2 rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-light-1 mb-2">Đã gửi yêu cầu!</h2>
          {ticketId && (
            <p className="text-xs text-slate-400 dark:text-light-4 mb-1 font-mono">#{ticketId.slice(0, 8)}</p>
          )}
          <p className="text-sm text-slate-500 dark:text-light-3 mb-6">
            Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc. Cảm ơn bạn đã liên hệ.
          </p>
          <button
            onClick={resetForm}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: '#009CD1' }}
          >
            Gửi yêu cầu khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50/60 dark:bg-[#0f0f10]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white dark:bg-dark-2 rounded-2xl shadow-md p-6 md:p-7">

          {/* Header */}
          <div className="flex items-center gap-3 mb-7">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-light-2 hover:bg-slate-100 dark:hover:bg-dark-3 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-[17px] font-bold text-slate-800 dark:text-light-1">Cần hỗ trợ</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Service */}
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-500 dark:text-light-3 mb-1.5 uppercase tracking-wide">
                Dịch vụ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select value={service} onChange={e => setService(e.target.value)} className={`${inputBase} appearance-none pr-9`}>
                  <option value="">Vui lòng chọn</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>

            {/* Need */}
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-500 dark:text-light-3 mb-1.5 uppercase tracking-wide">
                Bạn cần <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select value={need} onChange={e => setNeed(e.target.value)} className={`${inputBase} appearance-none pr-9`}>
                  <option value="">Vui lòng chọn</option>
                  {NEEDS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-500 dark:text-light-3 mb-1.5 uppercase tracking-wide">
                Mô tả <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Mô tả vấn đề của bạn..."
                  rows={5}
                  className={`${inputBase} resize-none placeholder-slate-300 dark:placeholder-slate-600`}
                />
                <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-300 dark:text-slate-600 select-none">
                  {MAX_DESC - desc.length}
                </span>
              </div>
            </div>

            {/* Attachment */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#009CD1]/30 bg-[#009CD1]/5">
                  <Paperclip size={14} className="text-[#009CD1] shrink-0" />
                  <span className="text-[12.5px] text-slate-700 dark:text-light-2 truncate flex-1">{file.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={removeFile} className="text-slate-400 hover:text-red-400 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[13px] font-medium text-slate-400 hover:text-[#009CD1] transition-colors"
                >
                  <Paperclip size={15} />
                  Đính kèm tệp
                  <span className="text-[11px] font-normal text-slate-300">(PDF, Word, Excel, ảnh · tối đa {MAX_FILE_MB} MB)</span>
                </button>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || createTicket.isPending || uploading}
              className="w-full py-2.5 rounded-xl text-[13.5px] font-semibold transition-all mt-1"
              style={{
                background: canSubmit && !createTicket.isPending && !uploading ? '#009CD1' : '#CBD5E1',
                color: '#fff',
                cursor: canSubmit && !createTicket.isPending && !uploading ? 'pointer' : 'not-allowed',
              }}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Đang upload…
                </span>
              ) : createTicket.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Đang gửi…
                </span>
              ) : 'Gửi'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
