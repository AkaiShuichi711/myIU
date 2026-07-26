import { useState, useRef, useEffect } from 'react';
import { X, Upload, Search, Check, Loader2, FileText, User } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { uploadFormSubmissionFile } from '@/lib/appwrite/api';
import { useCreateFormSubmission } from '@/lib/react-query/queriesAndMutations';
import { api } from '@/lib/api/client';
import type { IFormTemplate } from '@/types';

const inputCls = 'w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057A8]/25 focus:border-[#0057A8] transition-all';

type Suggestion = { name: string; email: string };

type Props = {
  template: IFormTemplate;
  onClose: () => void;
  onSuccess: () => void;
};

const FormSubmitModal = ({ template, onClose, onSuccess }: Props) => {
  const { user } = useUserContext();
  const { mutateAsync: createSubmission } = useCreateFormSubmission();

  const [file, setFile] = useState<File | null>(null);
  const [approverEmail, setApproverEmail] = useState('');
  const [approverName, setApproverName] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<'idle' | 'creating' | 'uploading' | 'done'>('idle');
  const [error, setError] = useState('');

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchApprover = (q: string) => {
    setApproverEmail(q);
    setApproverName('');
    if (searchRef.current) clearTimeout(searchRef.current);
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.get<Suggestion[]>(`/api/users/search?q=${encodeURIComponent(q)}`);
        setSuggestions(data ?? []);
        setShowSuggestions((data?.length ?? 0) > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const selectSuggestion = (s: Suggestion) => {
    setApproverEmail(s.email);
    setApproverName(s.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      await api.post('/api/email/send', { to, subject, html });
    } catch { /* best-effort */ }
  };

  const buildApproverEmail = (reviewUrl: string) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px">
      <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
        <div style="background:#0057A8;padding:16px 20px;border-radius:8px;margin-bottom:24px">
          <h1 style="color:white;margin:0;font-size:17px;font-weight:700">myIU Portal</h1>
          <p style="color:rgba(255,255,255,0.8);margin:3px 0 0;font-size:12px">Hệ thống biểu mẫu điện tử</p>
        </div>
        <h2 style="color:#19191a;font-size:15px;margin:0 0 6px">Yêu cầu duyệt biểu mẫu</h2>
        <p style="color:#475569;font-size:13px;margin:0 0 20px">Bạn nhận được yêu cầu duyệt từ <strong>${user.name}</strong> (${user.email})</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px">
          <tr><td style="padding:8px 12px;background:#f1f5f9;border-radius:4px 0 0 4px;color:#64748b;width:130px">Biểu mẫu</td>
              <td style="padding:8px 12px;background:#f8fafc;color:#19191a;font-weight:600">${template.title}</td></tr>
          <tr><td style="padding:8px 12px;color:#64748b">Người nộp</td>
              <td style="padding:8px 12px;color:#19191a">${user.name} — ${user.email}</td></tr>
        </table>
        <a href="${reviewUrl}" style="display:inline-block;background:#0057A8;color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600">
          Xem &amp; Duyệt biểu mẫu →
        </a>
        <p style="color:#94a3b8;font-size:11px;margin-top:20px">Nếu bạn không phải người duyệt phù hợp, hãy đăng nhập và từ chối với lý do để người nộp tìm đúng người phụ trách.</p>
      </div>
    </div>`;

  const handleSubmit = async () => {
    if (!file)          { setError('Vui lòng tải lên file biểu mẫu đã điền.'); return; }
    if (!approverEmail) { setError('Vui lòng nhập email người duyệt.'); return; }
    setError('');
    setIsSubmitting(true);

    try {
      // Step 1: create submission record (no file yet)
      setSubmitStep('creating');
      const doc = await createSubmission({
        submitterId:    user.id,
        submitterName:  user.name,
        submitterEmail: user.email,
        formTemplateId: template.$id,
        formTitle:      template.title,
        uploadedFileId:  null as any,
        uploadedFileUrl: null as any,
        approverEmail,
        approverName: approverName || approverEmail,
      });
      if (!doc) throw new Error('Tạo yêu cầu thất bại');

      // Step 2: upload the completed form file
      setSubmitStep('uploading');
      const uploadedUrl = await uploadFormSubmissionFile(doc.$id, file);
      if (!uploadedUrl) throw new Error('Upload file thất bại');

      // Step 3: send notification email (best-effort)
      const reviewUrl = `${window.location.origin}/forms/review/${doc.$id}`;
      const emailId   = user.email.split('@')[0];
      const subject   = `[Yêu cầu duyệt] ${template.title} — ${emailId}@${user.email.split('@')[1]}`;
      await sendEmail(approverEmail, subject, buildApproverEmail(reviewUrl));

      setSubmitStep('done');
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Đã có lỗi xảy ra');
      setSubmitStep('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel = submitStep === 'creating' ? 'Đang tạo yêu cầu…'
                  : submitStep === 'uploading' ? 'Đang tải file…'
                  : 'Nộp biểu mẫu';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Nộp biểu mẫu</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[280px]">{template.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Template download hint */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            <FileText size={14} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Tải template, điền xong rồi upload lại bên dưới</p>
              <a
                href={template.fileUrl}
                download={template.fileName}
                className="text-xs text-[#0057A8] hover:underline font-medium"
              >
                Tải template gốc ({template.fileName || template.title})
              </a>
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              File biểu mẫu đã điền *
            </label>
            <label className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg border-2 border-dashed transition-colors ${
              file ? 'border-[#0057A8]/40 bg-[#0057A8]/4' : 'border-slate-200 dark:border-slate-600 hover:border-[#0085b3]/40'
            }`}>
              <Upload size={15} className={file ? 'text-[#0057A8]' : 'text-slate-400'} />
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1">
                {file ? file.name : 'Chọn file (PDF, DOCX, …)'}
              </span>
              {file && <Check size={14} className="text-[#0057A8] shrink-0" />}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Approver email */}
          <div ref={wrapperRef} className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email người duyệt *
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={approverEmail}
                onChange={(e) => searchApprover(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Nhập tên hoặc email…"
                className={inputCls + ' pl-8 pr-8'}
              />
              {isSearching && (
                <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
              )}
              {approverName && !isSearching && (
                <Check size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0057A8]" />
              )}
            </div>

            {showSuggestions && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.email}
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <User size={12} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {approverName && (
              <p className="text-xs text-[#0057A8] mt-1 flex items-center gap-1">
                <Check size={11} /> {approverName}
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !file || !approverEmail}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {isSubmitting ? stepLabel : 'Nộp biểu mẫu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormSubmitModal;
