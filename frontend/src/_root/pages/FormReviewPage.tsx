import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, CheckCircle2, XCircle,
  Loader2, User, AlertTriangle,
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { useGetFormSubmissionById, useUpdateFormSubmission } from '@/lib/react-query/queriesAndMutations';
import { FORM_STATUS } from '@/constants/ui';
import type { IFormSubmission } from '@/types';

const BACKEND = (import.meta.env.VITE_OAUTH_BACKEND_URL || window.location.origin).replace(/\/+$/, '');

const buildResultEmail = (submitterName: string, formTitle: string, status: 'approved' | 'rejected', approverName: string, rejectionReason?: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px">
    <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
      <div style="background:#0068FF;padding:16px 20px;border-radius:8px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:17px;font-weight:700">myIU Portal</h1>
        <p style="color:rgba(255,255,255,0.8);margin:3px 0 0;font-size:12px">Hệ thống biểu mẫu điện tử</p>
      </div>
      <h2 style="color:#19191a;font-size:15px;margin:0 0 6px">
        ${status === 'approved' ? '✅ Biểu mẫu đã được duyệt' : '❌ Biểu mẫu bị từ chối'}
      </h2>
      <p style="color:#475569;font-size:13px;margin:0 0 16px">Xin chào <strong>${submitterName}</strong>,</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px">
        <tr><td style="padding:8px 12px;background:#f1f5f9;color:#64748b;width:130px">Biểu mẫu</td>
            <td style="padding:8px 12px;background:#f8fafc;color:#19191a;font-weight:600">${formTitle}</td></tr>
        <tr><td style="padding:8px 12px;color:#64748b">Kết quả</td>
            <td style="padding:8px 12px;color:${status === 'approved' ? '#059669' : '#ef4444'};font-weight:700">
              ${status === 'approved' ? 'ĐÃ DUYỆT' : 'BỊ TỪ CHỐI'}
            </td></tr>
        <tr><td style="padding:8px 12px;color:#64748b">Người duyệt</td>
            <td style="padding:8px 12px;color:#19191a">${approverName}</td></tr>
        ${status === 'rejected' && rejectionReason ? `
        <tr><td style="padding:8px 12px;color:#64748b">Lý do</td>
            <td style="padding:8px 12px;color:#ef4444">${rejectionReason}</td></tr>` : ''}
      </table>
      ${status === 'rejected' ? '<p style="color:#475569;font-size:13px">Vui lòng xem lại thông tin và nộp lại biểu mẫu với người duyệt phù hợp.</p>' : ''}
      <a href="${window.location.origin}/forms" style="display:inline-block;background:#0068FF;color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600">
        Xem danh sách biểu mẫu →
      </a>
    </div>
  </div>`;

const FormReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserContext();

  const { data: submissionDoc, isPending } = useGetFormSubmissionById(id || '');
  const { mutateAsync: updateSubmission, isPending: isUpdating } = useUpdateFormSubmission();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  const submission = submissionDoc as unknown as IFormSubmission | null;

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      await fetch(`${BACKEND}/api/email/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
    } catch { /* best-effort */ }
  };

  const handleApprove = async () => {
    if (!submission) return;
    await updateSubmission({ id: submission.$id, status: 'approved' });
    await sendEmail(
      submission.submitterEmail,
      `[Kết quả] ${submission.formTitle} — ĐÃ DUYỆT`,
      buildResultEmail(submission.submitterName, submission.formTitle, 'approved', user.name)
    );
    setActionDone(true);
  };

  const handleReject = async () => {
    if (!submission || !rejectionReason.trim()) return;
    await updateSubmission({ id: submission.$id, status: 'rejected', rejectionReason });
    await sendEmail(
      submission.submitterEmail,
      `[Kết quả] ${submission.formTitle} — BỊ TỪ CHỐI`,
      buildResultEmail(submission.submitterName, submission.formTitle, 'rejected', user.name, rejectionReason)
    );
    setActionDone(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Bạn cần đăng nhập để xem yêu cầu này.</p>
          <Link to="/sign-in" className="px-4 py-2 rounded-lg bg-[#0068FF] text-white text-sm font-semibold">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#0068FF]" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Không tìm thấy yêu cầu này.</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-sm text-[#0068FF] hover:underline">Quay lại</button>
        </div>
      </div>
    );
  }

  const statusMeta = FORM_STATUS[submission.status];
  const StatusIcon = statusMeta.Icon;
  const isApprover = user.email === submission.approverEmail;
  const isStatusPending = submission.status === 'pending';
  const isSubmitter = user.id === submission.submitterId;

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
              <FileText size={12} className="text-white" />
            </div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">Xét duyệt biểu mẫu</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-5 flex flex-col gap-4">
        {/* Status banner */}
        {actionDone && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00c578]/10 border border-[#00c578]/20 text-[#00c578] text-sm font-semibold">
            <CheckCircle2 size={16} /> Đã xử lý. Email thông báo đã được gửi cho người nộp.
          </div>
        )}

        {/* Main card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{submission.formTitle}</h2>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusMeta.color} ${statusMeta.bg}`}>
              <StatusIcon size={12} /> {statusMeta.label}
            </span>
          </div>

          <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              { label: 'Người nộp', value: submission.submitterName },
              { label: 'Email người nộp', value: submission.submitterEmail },
              { label: 'Người duyệt', value: submission.approverName },
              { label: 'Email người duyệt', value: submission.approverEmail },
              { label: 'Ngày nộp', value: new Date(submission.$createdAt).toLocaleString('vi-VN') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                <p className="text-slate-700 dark:text-slate-200 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {submission.status === 'rejected' && submission.rejectionReason && (
            <div className="mx-5 mb-4 px-3 py-2.5 rounded-lg bg-[#ef4e49]/8 border border-[#ef4e49]/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#ef4e49] mb-0.5">Lý do từ chối</p>
              <p className="text-sm text-[#ef4e49]">{submission.rejectionReason}</p>
            </div>
          )}

          {/* Download submitted file */}
          <div className="px-5 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">File đã nộp</p>
            <a
              href={submission.uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-[#0068FF]/40 transition-colors group w-fit"
            >
              <FileText size={14} className="text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Xem file biểu mẫu đã nộp</span>
              <Download size={12} className="text-slate-400 group-hover:text-[#0068FF] transition-colors" />
            </a>
          </div>
        </div>

        {/* Approver actions */}
        {isApprover && isStatusPending && !actionDone && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-[#0068FF]" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bạn là người được chỉ định duyệt</p>
            </div>

            {!showRejectInput ? (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#00c578] hover:bg-[#00b36d] transition-colors disabled:opacity-60"
                >
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Duyệt
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#ef4e49] bg-[#ef4e49]/8 hover:bg-[#ef4e49]/12 transition-colors"
                >
                  <XCircle size={13} /> Từ chối
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Lý do từ chối (bắt buộc)..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={isUpdating || !rejectionReason.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#ef4e49] hover:bg-[#e03b36] transition-colors disabled:opacity-60"
                  >
                    {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                    className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Non-approver notice */}
        {!isApprover && !isSubmitter && isStatusPending && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f5832f]/10 border border-[#f5832f]/20 text-[#f5832f] text-sm">
            <AlertTriangle size={14} />
            Chỉ <strong className="mx-1">{submission.approverEmail}</strong> mới có thể duyệt yêu cầu này.
          </div>
        )}
      </div>
    </div>
  );
};

export default FormReviewPage;
