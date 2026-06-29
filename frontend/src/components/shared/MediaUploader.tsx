import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, X, Image, Video, FileText, FileSpreadsheet,
  Presentation, File as FileIcon, Plus,
} from 'lucide-react';

export type MediaFile = {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'pdf' | 'word' | 'excel' | 'ppt' | 'file';
};

type MediaUploaderProps = {
  onChange: (files: File[]) => void;
  maxFiles?: number;
};

function getMimeCategory(mime: string): MediaFile['type'] {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime === 'application/msword') return 'word';
  if (mime.includes('excel') || mime === 'application/vnd.ms-excel') return 'excel';
  if (mime.includes('powerpoint') || mime === 'application/vnd.ms-powerpoint') return 'ppt';
  return 'file';
}

const TYPE_META: Record<MediaFile['type'], { icon: React.ReactNode; color: string; bg: string }> = {
  image:  { icon: <Image size={20} />,          color: 'text-sky-500',    bg: 'bg-sky-50 dark:bg-sky-900/20' },
  video:  { icon: <Video size={20} />,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  pdf:    { icon: <FileText size={20} />,        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  word:   { icon: <FileText size={20} />,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  excel:  { icon: <FileSpreadsheet size={20} />, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  ppt:    { icon: <Presentation size={20} />,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  file:   { icon: <FileIcon size={20} />,        color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-700' },
};

const fmt = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const MediaUploader = ({ onChange, maxFiles = 5 }: MediaUploaderProps) => {
  const [items, setItems] = useState<MediaFile[]>([]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = maxFiles - items.length;
      const toAdd = accepted.slice(0, remaining).map((f) => ({
        file: f,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
        type: getMimeCategory(f.type),
      }));
      const next = [...items, ...toAdd];
      setItems(next);
      onChange(next.map((i) => i.file));
    },
    [items, maxFiles, onChange]
  );

  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onChange(next.map((i) => i.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxSize: 50 * 1024 * 1024,
    disabled: items.length >= maxFiles,
  });

  const canAddMore = items.length < maxFiles;

  return (
    <div className="flex flex-col gap-3">
      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item, idx) => {
            const meta = TYPE_META[item.type];
            return (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                {item.type === 'image' ? (
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-28 object-cover"
                  />
                ) : item.type === 'video' ? (
                  <video
                    src={URL.createObjectURL(item.file)}
                    className="w-full h-28 object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <div className={`h-28 flex flex-col items-center justify-center gap-2 px-3 ${meta.bg}`}>
                    <div className={meta.color}>{meta.icon}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center truncate w-full px-1 font-medium">
                      {item.file.name}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{fmt(item.file.size)}</span>
                  </div>
                )}

                {/* File type badge */}
                <div className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${meta.bg} ${meta.color} border border-white/30`}>
                  {item.type.toUpperCase()}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {/* Add more button */}
          {canAddMore && (
            <div
              {...getRootProps()}
              className="h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#F15A22] hover:bg-[#F15A22]/4 transition-all"
            >
              <input {...getInputProps()} />
              <Plus size={20} className="text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-400 dark:text-slate-500">Add more</span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">{items.length}/{maxFiles}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty drop zone */}
      {items.length === 0 && (
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-14 px-8 text-center
            ${isDragActive
              ? 'border-[#F15A22] bg-[#F15A22]/5'
              : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center mb-4 shadow-sm">
            {isDragActive
              ? <UploadCloud size={26} className="text-[#F15A22]" />
              : <UploadCloud size={26} className="text-slate-400 dark:text-slate-500" />}
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">or click to browse · up to {maxFiles} files</p>

          {/* Supported type pills */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { label: 'Images', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' },
              { label: 'Video', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'PDF', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
              { label: 'Word', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Excel', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              { label: 'PPT', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
            ].map((t) => (
              <span key={t.label} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${t.color}`}>
                {t.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-3">Max 50 MB per file</p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
