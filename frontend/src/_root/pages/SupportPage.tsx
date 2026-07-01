import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useCreateSupportTicket } from '@/lib/react-query/queriesAndMutations';

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

const MAX_DESC = 2000;

const inputBase =
  'w-full rounded-xl border border-slate-200 dark:border-[#2a3a4a] bg-slate-50 dark:bg-dark-3 text-[13px] text-slate-700 dark:text-light-2 px-3.5 py-2.5 transition focus:outline-none focus:border-[#009CD1]/50 focus:bg-white dark:focus:bg-dark-2 focus:ring-2 focus:ring-[#009CD1]/10';

export default function SupportPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const createTicket = useCreateSupportTicket();

  const [service, setService]     = useState('');
  const [need, setNeed]           = useState('');
  const [desc, setDesc]           = useState('');
  const [file, setFile]           = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const canSubmit = service && need && desc.trim().length > 0;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    createTicket.mutate(
      { service, need, description: desc },
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
            onClick={() => { setSubmitted(false); setService(''); setNeed(''); setDesc(''); setFile(null); setTicketId(null); }}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: '#323393' }}
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
                <select
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className={`${inputBase} appearance-none pr-9`}
                >
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
                <select
                  value={need}
                  onChange={e => setNeed(e.target.value)}
                  className={`${inputBase} appearance-none pr-9`}
                >
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
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              {file ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2a3a4a] bg-slate-50 dark:bg-dark-3">
                  <Paperclip size={14} className="shrink-0" style={{ color: '#323393' }} />
                  <span className="text-[12.5px] text-slate-600 dark:text-light-3 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-light-3 hover:text-[#4040aa] dark:hover:text-[#4040aa] transition-colors"
                >
                  <Paperclip size={15} />
                  Đính kèm tệp
                </button>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || createTicket.isPending}
              className="w-full py-2.5 rounded-xl text-[13.5px] font-semibold transition-all mt-1"
              style={{
                background: canSubmit && !createTicket.isPending ? '#323393' : '#F9C4AE',
                color: '#fff',
                cursor: canSubmit && !createTicket.isPending ? 'pointer' : 'not-allowed',
              }}
            >
              {createTicket.isPending ? (
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
